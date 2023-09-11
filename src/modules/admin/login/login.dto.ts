import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLoginDto {}

export class ImageCaptchaDto {
  @ApiProperty({
    required: false,
    default: 100,
    description: '验证码宽度',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly width: number = 100;

  @ApiProperty({
    required: false,
    default: 50,
    description: '验证码高度',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly height: number = 50;
}

export class LoginInfoDto {
  @ApiProperty({ description: '管理员用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '管理员密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '验证码标识' })
  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @ApiProperty({ description: '用户输入的验证码' })
  @IsString()
  @IsNotEmpty()
  verifyCode: string;
}
