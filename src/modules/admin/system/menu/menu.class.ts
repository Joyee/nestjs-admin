import SysMenu from '@/entities/admin/sys-menu.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MenuItemAndParentInfoResult {
  @ApiProperty({ description: '菜单' })
  menu?: SysMenu;

  @ApiProperty({ description: '父级菜单' })
  parentMenu?: SysMenu;
}
