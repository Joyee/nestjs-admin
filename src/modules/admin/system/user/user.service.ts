import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { camelCase, isEmpty } from 'lodash';
import { CreateUserDto, PageSearchUserDto, UpdateUserDto } from './user.dto';
import { BusinessException } from '@/common/exception/business.exception';
import { UtilService } from '@/shared/services/util.service';
import { SysParamConfigService } from '../param-config/param-config.service';
import { SYS_USER_INITPASSWORD } from '@/common/constants/param-config.constants';
import SysUser from '@/entities/admin/sys-user.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import SysDepartment from '@/entities/admin/sys-department.entity';
import { PageSearchUserInfo } from './user.class';

@Injectable()
export class SysUserService {
  constructor(
    @InjectRepository(SysUser) private userRepository: Repository<SysUser>,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    private paramConfigService: SysParamConfigService,
    @InjectRepository(SysDepartment)
    private departmentRepository: Repository<SysDepartment>,
    @InjectEntityManager() private entityManager: EntityManager,
    @Inject(ROOT_ROLE_ID) private rootRoleId: number,
    private utilService: UtilService,
  ) {}

  /**
   * 新增系统用户, 如果返回false,说明已经存在该用户
   * @param params
   */
  async add(params: CreateUserDto): Promise<void> {
    const found = await this.userRepository.findOne({
      where: { username: params.username },
    });
    if (!isEmpty(found)) {
      throw new BusinessException(10001);
    }
    // 设置初始密码123456
    // 用于管理实体对象和数据库之间的交互。EntityManager 提供了一种称为事务（Transaction）的功能，用于在数据库中执行一系列操作，要么全部成功提交，要么全部回滚（撤销），以确保数据库的一致性。
    await this.entityManager.transaction(async (manager) => {
      // 在事务中执行一系列数据库操作
      const salt = this.utilService.generateRandomValue(32);

      // 查找配置的初始密码
      const initPassword = await this.paramConfigService.findValueByKey(
        SYS_USER_INITPASSWORD,
      );
      const password = this.utilService.md5(
        `${initPassword ?? '123456'}${salt}`,
      );
      const u = manager.create(SysUser, {
        departmentId: params.departmentId,
        username: params.username,
        password,
        name: params.name,
        nickName: params.nickName,
        email: params.email,
        phone: params.phone,
        remark: params.remark,
        status: params.status,
        psalt: salt,
      });
      await manager.save(u);
      const { roles } = params;
      const insertRoles = roles.map((role) => ({ roleId: role, userId: u.id }));
      // 分配角色
      await manager.insert(SysUserRole, insertRoles);
    });
  }

  /**
   * 更新用户信息
   * @param params
   */
  async update(params: UpdateUserDto): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      await manager.update(SysUser, params.id, {
        departmentId: params.departmentId,
        username: params.username,
        name: params.name,
        nickName: params.nickName,
        email: params.email,
        phone: params.phone,
        remark: params.remark,
        status: params.status,
      });
      // 先删除原来的角色关系
      await manager.delete(SysUserRole, { userId: params.id });
      const insertRoles = params.roles.map((roleId) => ({
        roleId,
        userId: params.id,
      }));
      // 重新分配角色
      await manager.insert(SysUserRole, insertRoles);
      // 禁用状态
      if (params.status === 0) {
        // TODO
      }
    });
  }

  async delete(userIds: number[]): Promise<void | never> {
    const rootUserId = await this.findRootUserId();
    if (userIds.includes(rootUserId)) {
      throw new Error('不能删除超级管理员!');
    }
    await this.userRepository.delete(userIds);
    await this.userRoleRepository.delete({ userId: In(userIds) });
  }

  /**
   * 查找超管的用户id
   */
  async findRootUserId(): Promise<number> {
    const result = await this.userRoleRepository.findOne({
      where: { id: this.rootRoleId },
    });
    return result.userId;
  }

  /**
   * 根据用户名查找已启用的用户
   * @param username
   */
  async findUserByUserName(username: string): Promise<SysUser | undefined> {
    return await this.userRepository.findOne({
      where: { username: username, status: 1 },
    });
  }

  /**
   * 查找用户信息
   * @param userId 用户id
   */
  async info(
    userId: number,
  ): Promise<SysUser & { roles: number[]; departmentName: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (isEmpty(user)) {
      throw new BusinessException(10017);
    }
    const departmentRow = await this.departmentRepository.findOne({
      where: { id: user.departmentId },
    });
    if (isEmpty(departmentRow)) {
      throw new BusinessException(10018);
    }
    const roleRows = await this.userRoleRepository.find({
      where: { userId: user.id },
    });
    const roles = roleRows.map((role) => role.roleId);
    delete user.password;
    return { ...user, roles, departmentName: departmentRow.name };
  }

  async infoList(ids: number[]): Promise<SysUser[]> {
    return await this.userRepository.findBy({ id: In(ids) });
  }

  /**
   * 根据部门id列表获取用户数量，去除超级管理员
   * @param uid
   * @param deptIds
   */
  async count(uid: number, deptIds: number[]): Promise<number> {
    const queryAll = isEmpty(deptIds);
    const rootUserId = await this.findRootUserId();
    if (queryAll) {
      return await this.userRepository.count({
        where: { id: Not(In([rootUserId, uid])) },
      });
    }
    return await this.userRepository.count({
      where: { id: Not(In([rootUserId, uid])), departmentId: In(deptIds) },
    });
  }

  /**
   * 根据部门id进行分页查询用户列表，deptId = -1时查询全部
   * @param uid
   * @param params
   */
  async listWithPagination(
    uid: number,
    params: PageSearchUserDto,
  ): Promise<[PageSearchUserInfo[], number]> {
    const { departmentIds, name, username, remark, phone, limit, page } =
      params;
    const queryAll = isEmpty(departmentIds);
    const rootUserId = await this.findRootUserId();
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder
      .innerJoinAndSelect('sys_department', 'dept', 'dept.id = user.department')
      .innerJoinAndSelect(
        'sys_user_role',
        'user_role',
        'user_role.user_id = user.id',
      )
      .innerJoinAndSelect('sys_role', 'role', 'role.id = user_role.role_id')
      .select([
        'user.id,GROUP_CONCAT(role.name) as roleNames',
        'dept.name',
        'user.*',
      ])
      .where('user.id NOT IN (:...ids)', { ids: [rootUserId, uid] })
      .andWhere(queryAll ? '1 = 1' : 'user.departmentId IN (:...deptIds)', {
        deptIds: departmentIds,
      })
      .andWhere('user.name LIKE :name', { name: `%${name}%` })
      .andWhere('user.username LIKE :username', { username: `%${username}%` })
      .andWhere('user.remark LIKE :remark', { remark: `%${remark}%` })
      .andWhere('user.phone LIKE :phone', { phone: `%${phone}%` })
      .orderBy('user.updated_at', 'ASC')
      .groupBy('user.id')
      .offset((page - 1) * limit)
      .limit(limit);
    const [_, total] = await queryBuilder.getManyAndCount();
    const list = await queryBuilder.getRawMany();
    const result: PageSearchUserInfo[] = list.map((n) => {
      const convertData = Object.entries<[string, any]>(n).map(
        ([key, value]) => [camelCase(key), value],
      );

      return {
        ...Object.fromEntries(convertData),
        departmentName: n.dept_name,
        roleName: n.roleNames.split(','),
      };
    });
    return [result, total];
  }

  async forbidden() {
    // TODO
  }

  async multiForbidden() {
    // TODO
  }

  async upgradePassword() {
    // TODO
  }
}
