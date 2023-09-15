import SysDepartment from '@/entities/admin/sys-department.entity';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateDeptDto {
  @ApiProperty({ description: '部门名称' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: '排序' })
  @IsInt()
  @Min(0)
  orderNum: number;

  @ApiProperty({ description: '上级部门id' })
  @IsInt()
  parentId: number;
}

export class UpdateDeptDto extends CreateDeptDto {
  @ApiProperty({ description: '需要更新的部门id' })
  @IsInt()
  @Min(0)
  id: number;
}

export class DeleteDeptDto {
  @ApiProperty({ description: '删除的系统部门ID' })
  @IsInt()
  @Min(0)
  departmentId: number;
}

export class InfoDeptDto {
  @ApiProperty({ description: '查询的系统部门ID' })
  @IsInt()
  @Min(0)
  departmentId: number;
}

export class DeptDetailDto {
  @ApiProperty({ description: '当前查询的部门' })
  department?: SysDepartment;

  @ApiProperty({ description: '所属父级部门' })
  parentDepartment?: SysDepartment;
}

export class TransferDeptDto {
  @ApiProperty({ description: '需要转移的管理员列表编号', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  userIds: number[];

  @ApiProperty({ description: '需要转移过去的系统部门ID' })
  @IsInt()
  @Min(0)
  departmentId: number;
}

export class MoveDept {
  @ApiProperty({ description: '当前部门id' })
  @IsInt()
  @Min(0)
  id: number;

  @ApiProperty({ description: '移动到当前指定父级部门的id' })
  @IsInt()
  @Min(0)
  parentId: number;
}

export class MoveDeptDto {
  @ApiProperty({ description: '部门列表', type: [MoveDept] })
  @ValidateNested({ each: true })
  @Type(() => MoveDept)
  depts: MoveDept[];
}
