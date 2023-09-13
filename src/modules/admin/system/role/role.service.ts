import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Like, Not, Repository } from 'typeorm';
import { difference, filter, includes, isEmpty, map } from 'lodash';

import {
  CreateRoleDto,
  PageSearchRoleDto,
  UpdateRoleDto,
} from '@/modules/admin/system/role/role.dto';
import SysRole from '@/entities/admin/sys-role.entity';
import SysRoleMenu from '@/entities/admin/sys-role-menu.entity';
import SysRoleDepartment from '@/entities/admin/sys-role-department.entity';
import {
  CreatedRoleId,
  RoleInfo,
} from '@/modules/admin/system/role/role.class';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import SysUserRole from '@/entities/admin/sys-user-role.entity';

@Injectable()
export class SysRoleService {
  constructor(
    @InjectRepository(SysRole) private roleRepository: Repository<SysRole>,
    @InjectRepository(SysRoleMenu)
    private roleMenuRepository: Repository<SysRoleMenu>,
    @InjectRepository(SysRoleDepartment)
    private roleDepartmentRepository: Repository<SysRoleDepartment>,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    @InjectEntityManager() private entityManager: EntityManager,
    @Inject(ROOT_ROLE_ID) private rootRoleId: number,
  ) {}

  /**
   * 新增角色
   * @param params
   * @param uid
   */
  async add(params: CreateRoleDto, uid: number): Promise<CreatedRoleId> {
    const { name, label, remark, menus, depts } = params;
    const role = await this.roleRepository.insert({
      name,
      label,
      remark,
      userId: `${uid}`,
    });
    const { identifiers } = role;
    const roleId = parseInt(identifiers[0].id);
    if (menus && menus.length > 0) {
      // 关联菜单
      const insertRow = menus.map((menu) => ({ roleId, menuId: menu }));
      await this.roleMenuRepository.insert(insertRow);
    }
    // 关联部门
    if (depts && depts.length > 0) {
      const insertRows = depts.map((dept) => ({ roleId, departmentId: dept }));
      await this.roleDepartmentRepository.insert(insertRows);
    }
    return { roleId };
  }

  /**
   * 更新角色信息
   * @param params
   */
  async update(params: UpdateRoleDto): Promise<SysRole> {
    const { roleId, name, label, remark, menus, depts } = params;
    const role = await this.roleRepository.save({
      id: roleId,
      name,
      label,
      remark,
    });
    const originDeptRows = await this.roleDepartmentRepository.find({
      where: { roleId },
    });
    const originMenuRows = await this.roleMenuRepository.find({
      where: { roleId },
    });
    const originDeptIds = originDeptRows.map((dep) => dep.departmentId);
    const originMenuIds = originMenuRows.map((menu) => menu.menuId);
    // 开始对比差异
    const insertMenusRowIds = difference(menus, originMenuIds);
    const insertDeptRowIds = difference(depts, originDeptIds);
    const deletedMenusRowIds = difference(originMenuIds, menus);
    const deleteDeptRowIds = difference(originDeptIds, depts);
    // using transaction
    await this.entityManager.transaction(async (manager) => {
      // 菜单
      if (insertMenusRowIds.length > 0) {
        // 有条目更新
        const insertRows = insertMenusRowIds.map((menuId) => ({
          roleId,
          menuId,
        }));
        await manager.insert(SysRoleMenu, insertRows);
      }
      if (deletedMenusRowIds.length > 0) {
        // 有菜单删除
        const realDeleteRowIds = filter(originMenuRows, (e) =>
          includes(deletedMenusRowIds, e.menuId),
        ).map((e) => e.id);
        await manager.delete(SysRoleMenu, realDeleteRowIds);
      }

      // 部门
      if (insertDeptRowIds.length > 0) {
        // 有条目更新
        const insertRows = insertDeptRowIds.map((e) => ({
          roleId,
          departmentId: e,
        }));
        await manager.insert(SysRoleDepartment, insertRows);
      }
      if (deleteDeptRowIds.length > 0) {
        // 有条目删除
        const realDeleteRowIds = filter(originDeptRows, (e) =>
          includes(deleteDeptRowIds, e.departmentId),
        ).map((e) => e.id);
        await manager.delete(SysRoleDepartment, realDeleteRowIds);
      }
    });
    // 如果勾选了新的菜单或取消勾选了原来的菜单，则通知前端重新获取权限菜单
    // TODO

    return role;
  }

  async delete(roleIds: number[]) {
    if (includes(roleIds, this.rootRoleId)) {
      throw new Error('不支持删除超级管理员');
    }
    await this.entityManager.transaction(async (manager) => {
      await manager.delete(SysRole, roleIds);
      await manager.delete(SysRoleMenu, { roleId: In(roleIds) });
      await manager.delete(SysRoleDepartment, { roleId: In(roleIds) });
    });
  }

  /**
   * 查询单个角色信息
   */
  async info(roleId: number): Promise<RoleInfo> {
    const roleInfo = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    const menus = await this.roleMenuRepository.find({ where: { roleId } });
    const depts = await this.roleDepartmentRepository.find({
      where: { roleId },
    });
    return { roleInfo, menus, depts };
  }

  /**
   * 查询角色列表，不包括超级管理员
   */
  async list(): Promise<SysRole[]> {
    return await this.roleRepository.find({
      where: { id: Not(this.rootRoleId) },
    });
  }

  async count(): Promise<number> {
    return await this.roleRepository.count({
      where: { id: Not(this.rootRoleId) },
    });
  }
  /**
   * 按分页查询角色列表，不包括超级管理员
   */
  async listWithPagination(
    params: PageSearchRoleDto,
  ): Promise<[SysRole[], number]> {
    const { limit, page, name, label, remark } = params;
    return await this.roleRepository.findAndCount({
      where: {
        id: Not(this.rootRoleId),
        name: Like(`%${name}%`),
        label: Like(`%${label}%`),
        remark: Like(`%${remark}%`),
      },
      order: { id: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  /**
   * 通过用户id查找角色id
   * @param userId 用户id
   */
  async getRoleIdByUser(userId: number): Promise<number[]> {
    const result = await this.userRoleRepository.find({
      where: { userId },
    });
    if (!isEmpty(result)) {
      return map(result, (v) => v.roleId);
    }
    return [];
  }

  /**
   * 根据角色id列表查找关联用户
   * @param roleIds
   */
  async countUserIdByRole(roleIds: number[]): Promise<number | never> {
    if (includes(roleIds, this.rootRoleId)) {
      throw new Error('不支持查看超级管理员');
    }
    return await this.userRoleRepository.count({
      where: { roleId: In(roleIds) },
    });
  }
}
