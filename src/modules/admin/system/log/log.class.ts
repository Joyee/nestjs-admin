import { ApiProperty } from '@nestjs/swagger';

export class LoginLogInfo {
  @ApiProperty({ description: '日志编号' })
  id: number;

  @ApiProperty({ description: '登录用户名' })
  username: string;

  @ApiProperty({ description: '登录ip' })
  ip: string;

  @ApiProperty({ description: '登录系统' })
  os: string;

  @ApiProperty({ description: '浏览器' })
  browser: string;

  @ApiProperty({ description: '登录时间' })
  time: string;
}
