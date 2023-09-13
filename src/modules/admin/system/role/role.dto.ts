import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { PageOptionsDto } from '@/common/dto/page.dto';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: '角色唯一标识' })
  @IsString()
  @Matches(/^[a-z0-9A-Z]+$/)
  label: string;

  @ApiProperty({ description: '角色备注', required: false })
  @IsString()
  @IsOptional()
  remark: string;

  @ApiProperty({ description: '关联菜单、权限编号', required: false })
  @IsOptional()
  @IsArray()
  menus: number[];

  @ApiProperty({ description: '关联部门编号', required: false })
  @IsOptional()
  @IsArray()
  depts: number[];
}

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({
    description: '关联部门编号',
  })
  @IsInt()
  @Min(0)
  roleId: number;
}

export class PageSearchRoleDto extends PageOptionsDto {
  @ApiProperty({ description: '角色名称', required: false })
  @IsString()
  @IsOptional()
  name = '';

  @ApiProperty({ description: '角色唯一标识', required: false })
  @IsString()
  @IsOptional()
  label = '';

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark = '';
}

export class InfoRoleDto {
  @ApiProperty({
    description: '需要查找的角色ID',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  roleId: number;
}

export class DeleteRoleDto {
  @ApiProperty({
    description: '需要删除的角色id集合',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  roleIds: number[];
}
