import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SysUserService } from './user.service';
import { CreateUserDto } from './user.dto';

@ApiTags('管理员模块')
@Controller('user')
export class SysUserController {
  constructor(private userService: SysUserService) {}

  @ApiOperation({ summary: '新增管理员' })
  @Post('add')
  async add(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.add(dto);
  }
}
