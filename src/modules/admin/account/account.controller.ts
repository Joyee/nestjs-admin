import { Controller, Get, Req } from '@nestjs/common';
import { SysUserService } from '@/modules/admin/system/user/user.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AccountInfo } from '../system/user/user.class';
import { PermissionOptional } from '../core/decorators/permission-optional.decorator';
import { AdminUser } from '@/modules/admin/core/decorators/admin-user.decorator';
import { IAdminUser } from '@/modules/admin/admin.instance';
import { FastifyRequest } from 'fastify';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { PermMenuInfo } from '@/modules/admin/login/login.class';
import { LoginService } from '@/modules/admin/login/login.service';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('账户模块')
@Controller('')
export class AccountController {
  constructor(
    private userService: SysUserService,
    private loginService: LoginService,
  ) {}

  @ApiOperation({ summary: '获取管理员资料' })
  @ApiOkResponse({ type: AccountInfo })
  @PermissionOptional()
  @Get('info')
  async info(@AdminUser() user: IAdminUser, @Req() req: FastifyRequest) {
    return await this.userService.getAccountInfo(user.uid, req.ip);
  }

  @ApiOperation({ summary: '获取菜单列表及权限列表' })
  @ApiOkResponse({ type: PermMenuInfo })
  @PermissionOptional()
  @Get('permmenu')
  async permmenu(@AdminUser() user: IAdminUser): Promise<PermMenuInfo> {
    return await this.loginService.getPermMenu(user.uid);
  }
}
