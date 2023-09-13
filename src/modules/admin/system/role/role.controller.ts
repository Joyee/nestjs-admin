import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_PREFIX } from '../../admin.constants';
import { AdminUser } from '@/modules/admin/core/decorators/admin-user.decorator';
import { SysRoleService } from './role.service';
import SysRole from '@/entities/admin/sys-role.entity';
import {
  CreateRoleDto,
  DeleteRoleDto,
  InfoRoleDto,
  PageSearchRoleDto,
  UpdateRoleDto,
} from '@/modules/admin/system/role/role.dto';
import { IAdminUser } from '@/modules/admin/admin.instance';
import { RoleInfo } from '@/modules/admin/system/role/role.class';
import { BusinessException } from '@/common/exception/business.exception';
import { PaginatedResponseDto } from '@/helper';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('角色模块')
@Controller('role')
export class SysRoleController {
  constructor(private roleService: SysRoleService) {}

  @ApiOperation({ summary: '获取角色列表' })
  @ApiOkResponse({ type: [SysRole] })
  @Get('list')
  async list(): Promise<SysRole[]> {
    return await this.roleService.list();
  }

  @ApiOperation({ summary: '分页查询角色信息' })
  @ApiOkResponse({ type: [SysRole] })
  @Get('page')
  async page(
    @Query() dto: PageSearchRoleDto,
  ): Promise<PaginatedResponseDto<SysRole>> {
    const [list, total] = await this.roleService.listWithPagination(dto);
    return {
      list,
      pagination: {
        size: dto.limit,
        page: dto.page,
        total,
      },
    };
  }

  @ApiOperation({ summary: '新增角色' })
  @Post('add')
  async add(@Body() dto: CreateRoleDto, @AdminUser() user: IAdminUser) {
    return await this.roleService.add(dto, user.uid);
  }

  @ApiOperation({ summary: '更新角色' })
  @Post('update')
  async update(@Body() dto: UpdateRoleDto) {
    await this.roleService.update(dto);
    // TODO 刷新所有在线用户的权限
  }

  @ApiOperation({ summary: '获取角色信息' })
  @Get('info')
  async info(@Query() dto: InfoRoleDto): Promise<RoleInfo> {
    return this.roleService.info(dto.roleId);
  }

  @ApiOperation({ summary: '删除角色' })
  @Post('delete')
  async delete(@Body() dto: DeleteRoleDto) {
    const count = await this.roleService.countUserIdByRole(dto.roleIds);
    if (count > 0) {
      throw new BusinessException(10008);
    }
    await this.roleService.delete(dto.roleIds);
    // TODO 刷新所有在线用户的权限
  }
}
