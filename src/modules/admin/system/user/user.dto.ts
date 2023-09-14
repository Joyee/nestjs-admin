import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  ValidateIf,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsEmail,
  IsIn,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { isEmpty } from 'lodash';
import { PageOptionsDto } from '@/common/dto/page.dto';

export class CreateUserDto {
  @ApiProperty({
    description: '所属部门编号',
  })
  @IsInt()
  @Min(0)
  departmentId: number;

  @ApiProperty({
    description: '用户姓名',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: '登录账号',
  })
  @IsString()
  @Matches(/^[a-z0-9A-Z]+$/)
  @MinLength(6)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: '归属角色',
    type: [Number],
  })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  roles: number[];

  @ApiProperty({
    required: false,
    description: '呢称',
  })
  @IsString()
  @IsOptional()
  nickName: string;

  @ApiProperty({
    required: false,
    description: '邮箱',
  })
  @IsEmail()
  @ValidateIf((o) => !isEmpty(o.email))
  email: string;

  @ApiProperty({
    required: false,
    description: '手机号',
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({
    required: false,
    description: '备注',
  })
  @IsString()
  @IsOptional()
  remark: string;

  @ApiProperty({
    description: '状态',
  })
  @IsIn([0, 1])
  status: number;
}

export class UpdateUserDto extends CreateUserDto {
  @ApiProperty({
    description: '用户ID',
  })
  @IsInt()
  @Min(0)
  id: number;
}

export class InfoUserDto {
  @ApiProperty({
    description: '用户ID',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  userId: number;
}

export class PageSearchUserDto extends PageOptionsDto {
  @ApiProperty({ required: false, description: '部门列表', type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  departmentIds: number[];

  @ApiProperty({ required: false, description: '用户姓名', default: '' })
  @IsString()
  name = '';

  @ApiProperty({ required: false, description: '用户名', default: '' })
  @IsString()
  username = '';

  @ApiProperty({ required: false, description: '邮箱', default: '' })
  @IsString()
  email = '';

  @ApiProperty({ required: false, description: '手机号', default: '' })
  @IsString()
  @IsOptional()
  phone = '';

  @ApiProperty({ required: false, description: '用户备注', default: '' })
  @IsString()
  remark = '';
}
