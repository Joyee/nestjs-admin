import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SysMenu from '@/entities/admin/sys-menu.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { SysRoleService } from '@/modules/admin/system/role/role.service';
import { concat, includes, isEmpty, uniq } from 'lodash';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';

@Injectable()
export class SysMenuService {
  constructor(
    @InjectRepository(SysMenu) private menuRepository: Repository<SysMenu>,
    private roleService: SysRoleService,
    @Inject(ROOT_ROLE_ID) private rootRoleId: number,
  ) {}

  /**
   * 根据角色获取所有菜单
   * @param uid
   */
  async getMenus(uid: number): Promise<SysMenu[]> {
    const roleIds = await this.roleService.getRoleIdByUser(uid);
    let menus: SysMenu[] = [];
    if (includes(roleIds, this.rootRoleId)) {
      menus = await this.menuRepository.find();
    } else {
      // [1,2,3] role find
      menus = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect(
          'sys_role_menu',
          'role_menu',
          'menu.id = role_menu.menu_id',
        )
        .andWhere('role_menu.role_id IN (:...roleIds)', { roleIds: roleIds })
        .orderBy('menu.order_num', 'DESC')
        .getMany();
    }
    return menus;
  }

  /**
   * 获取当前用户的所有权限
   * @param uid
   */
  async getPerms(uid: number): Promise<string[]> {
    const roleIds = await this.roleService.getRoleIdByUser(uid);
    let perms: string[] = [];
    let result: any = null;
    if (includes(roleIds, this.rootRoleId)) {
      // type 类型，0：目录、1：菜单、2：按钮
      result = await this.menuRepository.find({
        where: { perms: Not(IsNull()), type: 2 },
      });
    } else {
      result = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect(
          'sys_role_menu',
          'role_menu',
          'menu.id = role_menu.menu_id',
        )
        .andWhere('role_menu.role_id IN (:...roleIds)', { roleIds })
        .andWhere('menu.type = 2')
        .andWhere('menu.perms IS NOT NULL')
        .getMany();
    }
    if (isEmpty(result)) {
      result.forEach((e) => {
        perms = concat(perms, e.perms.split(','));
      });
      perms = uniq(perms);
    }
    return perms;
  }
}
