import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 增加菜单
 */
export class CreateMenuDto {
  @ApiProperty({ description: '菜单类型' })
  @IsIn([0, 1, 2]) // 0=目录 1=菜单 2=权限
  type: number;

  @ApiProperty({ description: '父级菜单' })
  @IsInt()
  parentId: number;

  @ApiProperty({ description: '菜单或权限名称' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: '排序' })
  @IsInt()
  @Min(0)
  orderNum: number;

  @ApiProperty({ description: '前端路由地址' })
  @IsString()
  @ValidateIf((o) => o.type !== 2)
  router: string;

  @ApiProperty({ description: '菜单是否显示', required: false, default: true })
  @IsBoolean()
  @ValidateIf((o) => o.type !== 2)
  readonly isShow: boolean = true;

  @ApiProperty({ description: '开启页面缓存', required: false, default: true })
  @IsBoolean()
  @ValidateIf((o) => o.type === 1)
  readonly keepalive: boolean = true;

  @ApiProperty({ description: '是否外链', required: false, default: false })
  @IsBoolean()
  readonly isExt: boolean = false;

  @ApiProperty({ description: '外链打开方式', required: false, default: 1 })
  @IsIn([1, 2])
  @ValidateIf((o) => o.isExt === true && o.type === 1)
  readonly openMode: number;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type !== 2)
  icon: string;

  @ApiProperty({ description: '对应权限' })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.type === 2)
  perms: string;

  @ApiProperty({ description: '菜单路由路径或外链' })
  @ValidateIf((o) => o.type !== 2)
  @IsString()
  @IsOptional()
  viewPath: string;
}

export class UpdateMenuDto extends CreateMenuDto {
  @ApiProperty({ description: '更新的菜单id' })
  @IsInt()
  @Min(0)
  menuId: number;
}

export class DeleteMenuDto {
  @ApiProperty({ description: '删除的菜单id' })
  @IsInt()
  @Min(0)
  menuId: number;
}

/**
 * 查询菜单
 */
export class InfoMenuDto {
  @ApiProperty({ description: '查询的菜单ID' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  menuId: number;
}
