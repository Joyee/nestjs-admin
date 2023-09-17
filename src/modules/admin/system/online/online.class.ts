import { ApiProperty } from '@nestjs/swagger';

export class OnlineUserInfo {
  @ApiProperty({ description: '最近的一条记录id' })
  id: number;

  @ApiProperty({ description: '登录ID' })
  ip: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '是否当前' })
  isCurrent: boolean;

  @ApiProperty({ description: '登录时间' })
  time: string;

  @ApiProperty({ description: '系统' })
  os: string;

  @ApiProperty({ description: '浏览器' })
  browser: string;

  @ApiProperty({ description: '是否禁用' })
  disable: boolean;
}
