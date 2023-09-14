import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Optional } from '@nestjs/common';

export class UpdatePersonInfoDto {
  @ApiProperty({ description: '管理员昵称', required: false })
  @IsString()
  @Optional()
  nickName: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsString()
  @Optional()
  email: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsString()
  @Optional()
  phone: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @Optional()
  remark: string;
}
