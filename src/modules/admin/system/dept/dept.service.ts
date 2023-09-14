import SysDepartment from '@/entities/admin/sys-department.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysRoleService } from '../role/role.service';
import { includes } from 'lodash';
import { ROOT_ROLE_ID } from '../../admin.constants';

@Injectable()
export class SysDeptService {
  constructor(
    @InjectRepository(SysDepartment)
    private deptRepository: Repository<SysDepartment>,
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
}
