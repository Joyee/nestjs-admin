import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { SysMenuService } from '@/modules/admin/system/menu/menu.service';
import SysMenu from '@/entities/admin/sys-menu.entity';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('菜单模块')
@Controller('menu')
export class SysMenuController {
  constructor(private menuService: SysMenuService) {}

  @ApiOperation({ summary: '获取对应权限的菜单列表' })
  @ApiOkResponse({ type: [SysMenu] })
  @Get('list')
  async list() {
    //   TODO
  }
}
