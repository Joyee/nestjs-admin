import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'sys_department' })
export default class SysDepartment extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'parent_id', nullable: true })
  @ApiProperty({ description: '上级部门id' })
  parentId: number;

  @Column()
  @ApiProperty({ description: '部门名称' })
  name: string;

  @Column({ name: 'order_num' })
  @ApiProperty()
  orderNum: number;
}
