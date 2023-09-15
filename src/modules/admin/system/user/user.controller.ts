import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SysUserService } from './user.service';
import {
  CreateUserDto,
  DeleteUserDto,
  InfoUserDto,
  MultipleForbiddenUserIdsDto,
  PageSearchUserDto,
  PasswordUserDto,
  UpdateUserDto,
} from './user.dto';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { AdminUser } from '../../core/decorators/admin-user.decorator';
import { IAdminUser } from '../../admin.instance';
import { PaginatedResponseDto } from '@/helper';
import { PageSearchUserInfo, UserDetailInfo } from './user.class';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('管理员模块')
@Controller('user')
export class SysUserController {
  constructor(private userService: SysUserService) {}

  @ApiOperation({ summary: '新增管理员' })
  @Post('add')
  async add(@Body() dto: CreateUserDto): Promise<void> {
    await this.userService.add(dto);
  }

  @ApiOperation({ summary: '更新用户信息' })
  @Post('update')
  async update(@Body() dto: UpdateUserDto): Promise<void> {
    await this.userService.update(dto);
  }

  @ApiOperation({ summary: '删除用户' })
  @Post('delete')
  async delete(@Body() dto: DeleteUserDto): Promise<void> {
    await this.userService.delete(dto.userIds);
  }

  @ApiOperation({ summary: '分页获取管理员列表' })
  @Post('page')
  async pagination(
    @Body() dto: PageSearchUserDto,
    @AdminUser() user: IAdminUser,
  ): Promise<PaginatedResponseDto<PageSearchUserInfo>> {
    const [list, total] = await this.userService.listWithPagination(
      user.uid,
      dto,
    );
    return {
      list,
      pagination: {
        total,
        page: dto.page,
        size: dto.limit,
      },
    };
  }

  @ApiOperation({ summary: '获取用户信息' })
  @Get('info')
  async info(@Query() dto: InfoUserDto): Promise<UserDetailInfo> {
    return await this.userService.info(dto.userId);
  }

  @ApiOperation({ summary: '禁用多个用户' })
  @Post('forbidden')
  async multiForbidden(@Body() dto: MultipleForbiddenUserIdsDto) {
    await this.userService.multiForbidden(dto.userIds);
  }

  @ApiOperation({ summary: '更改指定管理员密码' })
  @Post('password')
  async password(@Body() dto: PasswordUserDto) {}
}
