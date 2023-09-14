import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SysUserService } from './user.service';
import { CreateUserDto, PageSearchUserDto } from './user.dto';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { AdminUser } from '../../core/decorators/admin-user.decorator';
import { IAdminUser } from '../../admin.instance';
import { PaginatedResponseDto } from '@/helper';
import { PageSearchUserInfo } from './user.class';

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
}
