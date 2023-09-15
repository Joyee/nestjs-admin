import SysDepartment from '@/entities/admin/sys-department.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { includes, isEmpty } from 'lodash';
import { SysRoleService } from '../role/role.service';
import { ROOT_ROLE_ID } from '../../admin.constants';
import {
  CreateDeptDto,
  DeptDetailDto,
  MoveDept,
  UpdateDeptDto,
} from './dept.dto';
import SysUser from '@/entities/admin/sys-user.entity';
import SysRoleDepartment from '@/entities/admin/sys-role-department.entity';
import { BusinessException } from '@/common/exception/business.exception';

@Injectable()
export class SysDeptService {
  constructor(
    @InjectRepository(SysUser) private userRepository: Repository<SysUser>,
    @InjectRepository(SysRoleDepartment)
    private roleDeptRepostitoy: Repository<SysRoleDepartment>,
    @InjectRepository(SysDepartment)
    private deptRepository: Repository<SysDepartment>,
    @InjectEntityManager() private entityManager: EntityManager,
    @Inject(ROOT_ROLE_ID) private rootRoleId: number,
    private roleService: SysRoleService,
  ) {}

  async list(): Promise<SysDepartment[]> {
    return await this.deptRepository.find({ order: { orderNum: 'DESC' } });
  }

  /**
   * 根据当前角色id获取部门列表
   * @param uid
   */
  async getDepts(uid: number): Promise<SysDepartment[]> {
    const roleIds = await this.roleService.getRoleIdByUser(uid);
    console.log(roleIds);
    let depts: any = [];
    if (includes(roleIds, this.rootRoleId)) {
      depts = await this.deptRepository.find();
    } else {
      depts = await this.deptRepository
        .createQueryBuilder('dept')
        .innerJoinAndSelect(
          'sys_role_department',
          'role_dept',
          'dept.id = role_dept.department_id',
        )
        .andWhere('role_dept.role_id IN (:...roleIds)', { roleIds })
        .orderBy('dept.order_name', 'ASC')
        .getMany();
    }

    return depts;
  }

  async add(dto: CreateDeptDto): Promise<void> {
    await this.deptRepository.insert({
      name: dto.name,
      orderNum: dto.orderNum || 0,
      parentId: dto.parentId === -1 ? null : dto.parentId,
    });
  }

  async update(dto: UpdateDeptDto): Promise<void> {
    await this.deptRepository.update(dto.id, {
      parentId: dto.parentId === -1 ? null : dto.parentId,
      name: dto.name,
      orderNum: dto.orderNum,
    });
  }

  async delete(departmentId: number): Promise<void> {
    await this.deptRepository.delete(departmentId);
  }

  async countUserByDepartmentId(departmentId: number): Promise<number> {
    return await this.userRepository.count({ where: { departmentId } });
  }

  async countRoleByDepartementId(departmentId: number): Promise<number> {
    return await this.roleDeptRepostitoy.count({ where: { departmentId } });
  }

  async countChildrenDepartment(departmentId: number): Promise<number> {
    return await this.deptRepository.count({
      where: { parentId: departmentId },
    });
  }

  /**
   * 根据id查询部门信息
   * @param id 部门id
   */
  async info(id: number): Promise<DeptDetailDto> {
    const department = await this.deptRepository.findOne({ where: { id } });
    if (isEmpty(department)) {
      throw new BusinessException(10019);
    }

    let parentDepartment = null;
    if (department.parentId) {
      parentDepartment = await this.deptRepository.findOne({
        where: { id: department.parentId },
      });
    }

    return { department, parentDepartment };
  }

  /**
   * 转移部门
   */
  async transfer(userIds: number[], deptId: number): Promise<void> {
    await this.userRepository.update(
      { id: In(userIds) },
      { departmentId: deptId },
    );
  }

  async move(depts: MoveDept[]): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      for (let i = 0; i < depts.length; i++) {
        await manager.update(
          SysDepartment,
          { id: depts[i].id },
          { parentId: depts[i].parentId },
        );
      }
    });
  }
}
