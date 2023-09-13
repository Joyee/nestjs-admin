import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 系统角色部门关系
 */
@Entity({ name: 'sys_role_department' })
export default class SysRoleDepartment extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'role_id' })
  @ApiProperty()
  roleId: number;

  @Column({ name: 'department_id' })
  @ApiProperty()
  departmentId: number;
}
