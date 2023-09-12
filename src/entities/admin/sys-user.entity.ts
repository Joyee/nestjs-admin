import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../base.entity'; // 假设 BaseEntity 存在于相同的文件夹中
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'sys_user' })
export default class SysUser extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ApiProperty({ description: 'ID' })
  id: number;

  @Column({ unsigned: true, name: 'department_id' })
  @ApiProperty({ description: '部门编号' })
  departmentId: number;

  @Column()
  @ApiProperty({ description: '姓名' })
  name: string;

  @Column()
  @ApiProperty({ description: '登录账号' })
  username: string;

  @Column()
  @ApiProperty({ description: '密码' })
  password: string;

  @Column({ length: 32 })
  @ApiProperty({ description: '密码盐值' })
  psalt: string;

  @Column({ nullable: true, name: 'nick_name' })
  @ApiProperty({ description: '昵称' })
  nickName: string | null;

  @Column({ nullable: true, name: 'head_img' })
  @ApiProperty({ description: '头像' })
  headImg: string | null;

  @Column({ nullable: true })
  @ApiProperty({ description: '邮箱', default: '' })
  email: string | null;

  @Column({ nullable: true })
  @ApiProperty({ description: '手机号', default: '' })
  phone: string | null;

  @Column({ nullable: true })
  @ApiProperty({ description: '备注', default: '' })
  remark: string | null;

  @Column({ default: 1 })
  @ApiProperty({ description: '状态 (0: 禁用, 1: 启用)', default: 1 })
  status: number;
}
