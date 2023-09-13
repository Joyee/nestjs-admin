import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'sys_menu' })
export default class SysMenu extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'parent_id', nullable: true })
  @ApiProperty({ description: '父菜单ID' })
  parentId: number;

  @Column()
  @ApiProperty({ description: '菜单名称' })
  name: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '菜单地址' })
  router: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '权限标识' })
  perms: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '类型，0：目录、1：菜单、2：按钮',
  })
  @ApiProperty({ description: '类型，0：目录、1：菜单、2：按钮' })
  type: number;

  @Column({ nullable: true })
  @ApiProperty({ description: '菜单对应图标' })
  icon: string;

  @Column({
    name: 'order_num',
    type: 'int',
    default: 0,
    nullable: true,
  })
  @ApiProperty({ description: '排序' })
  orderNum: number;

  @Column({ name: 'view_path', nullable: true })
  @ApiProperty()
  viewPath: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  @ApiProperty()
  keepalive: boolean;

  @Column({ name: 'is_show', type: 'boolean', nullable: true, default: true })
  @ApiProperty({ description: '是否显示在菜单栏' })
  isShow: boolean;

  @Column({ name: 'is_ext', type: 'boolean', nullable: true, default: true })
  @ApiProperty()
  isExt: boolean;

  @Column({ name: 'open_mode', type: 'tinyint', nullable: true, default: true })
  @ApiProperty()
  openMode: number;
}
