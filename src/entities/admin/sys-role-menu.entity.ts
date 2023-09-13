import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';

// 系统角色菜单关系
@Entity({ name: 'sys_role_menu' })
export default class SysRoleMenu extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'role_id' })
  @ApiProperty()
  roleId: number;

  @Column({ name: 'menu_id' })
  @ApiProperty()
  menuId: number;
}
