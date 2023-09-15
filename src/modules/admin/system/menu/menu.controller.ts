import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ADMIN_PREFIX,
  FORBIDDEN_OP_MENU_ID_INDEX,
} from '@/modules/admin/admin.constants';
import { SysMenuService } from '@/modules/admin/system/menu/menu.service';
import SysMenu from '@/entities/admin/sys-menu.entity';
import { AdminUser } from '../../core/decorators/admin-user.decorator';
import {
  CreateMenuDto,
  DeleteMenuDto,
  InfoMenuDto,
  UpdateMenuDto,
} from '@/modules/admin/system/menu/menu.dto';
import { BusinessException } from '@/common/exception/business.exception';
import { flattenDeep } from 'lodash';
import { MenuItemAndParentInfoResult } from '@/modules/admin/system/menu/menu.class';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('菜单模块')
@Controller('menu')
export class SysMenuController {
  constructor(private menuService: SysMenuService) {}

  @ApiOperation({ summary: '获取对应权限的菜单列表' })
  @ApiOkResponse({ type: [SysMenu] })
  @Get('list')
  async list(@AdminUser('uid') uid: number): Promise<SysMenu[]> {
    return await this.menuService.getMenus(uid);
  }

  @ApiOperation({ summary: '新增菜单或权限' })
  @Post('add')
  async add(@Body() dto: CreateMenuDto): Promise<void> {
    await this.menuService.check(dto);
    if (dto.parentId === -1) {
      dto.parentId = null;
    }
    await this.menuService.save(dto);
    if (dto.type === 2) {
      // 权限发生更改，则刷新所有在线用户的权限
      await this.menuService.refreshOnlineUserPerms();
    }
  }

  @ApiOperation({ summary: '更新菜单或权限' })
  @Post('update')
  async update(@Body() dto: UpdateMenuDto): Promise<void> {
    if (dto.menuId <= FORBIDDEN_OP_MENU_ID_INDEX) {
      throw new BusinessException(10016);
    }
    await this.menuService.check(dto);
    if (dto.parentId === -1) {
      dto.parentId = null;
    }
    await this.menuService.save({ ...dto, id: dto.menuId });
    if (dto.type === 2) {
      // 权限发生更改，则刷新所有在线用户的权限
      await this.menuService.refreshOnlineUserPerms();
    }
  }

  @ApiOperation({ summary: '删除菜单或权限' })
  @Post('delete')
  async delete(@Body() dto: DeleteMenuDto): Promise<void> {
    if (dto.menuId <= FORBIDDEN_OP_MENU_ID_INDEX) {
      throw new BusinessException(10016);
    }
    // 如果有子目录一起删除
    const childMenu = await this.menuService.findChildMenus(dto.menuId);
    await this.menuService.deleteMenuItem(flattenDeep([dto.menuId, childMenu]));
    // 权限发生更改，则刷新所有在线用户的权限
    await this.menuService.refreshOnlineUserPerms();
  }

  @ApiOperation({ summary: '菜单或权限信息' })
  @ApiOkResponse({ type: MenuItemAndParentInfoResult })
  @Get('info')
  async info(@Query() dto: InfoMenuDto): Promise<MenuItemAndParentInfoResult> {
    return await this.menuService.getMenuItemAndParentInfo(dto.menuId);
  }
}
