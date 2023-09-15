import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SysMenu from '@/entities/admin/sys-menu.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { SysRoleService } from '@/modules/admin/system/role/role.service';
import { concat, includes, isEmpty, uniq } from 'lodash';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import { CreateMenuDto } from '@/modules/admin/system/menu/menu.dto';
import { BusinessException } from '@/common/exception/business.exception';
import { RedisService } from '@/shared/services/redis.service';
import { MenuItemAndParentInfoResult } from '@/modules/admin/system/menu/menu.class';

@Injectable()
export class SysMenuService {
  constructor(
    @InjectRepository(SysMenu) private menuRepository: Repository<SysMenu>,
    private redisService: RedisService,
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
    if (!isEmpty(result)) {
      result.forEach((e) => {
        perms = concat(perms, e.perms.split(','));
      });
      perms = uniq(perms);
    }
    return perms;
  }

  /**
   * 检查菜单创建规则是否符合规则
   * @param dto
   */
  async check(dto: CreateMenuDto & { menuId?: number }): Promise<void | never> {
    if (dto.type === 2 && dto.parentId === -1) {
      // 无法直接创建
      throw new BusinessException(10005);
    }
    if (dto.type === 1 && dto.parentId !== -1) {
      const parent = await this.getMenuItemInfo(dto.parentId);
      if (isEmpty(parent)) {
        throw new BusinessException(10014);
      }
      if (parent && parent.type === 1) {
        // 当前新增菜单为菜单且父节点也为菜单时为非法操作
        throw new BusinessException(10006);
      }
    }
    // 判断同级菜单路由是否重复
    if (!Object.is(dto.type, 2)) {
      // 查找所有一级菜单
      const menus = await this.menuRepository.find({
        where: { parentId: Object.is(dto.parentId, -1) ? null : dto.parentId },
      });
      const router = dto.router.split('/').filter(Boolean).join('/');
      const pathRef = new RegExp(`^/?${router}?$/`);
      const isExist = menus.some(
        (m) => pathRef.test(m.router) && m.id !== dto.menuId,
      );
      if (isExist) {
        // 同级菜单路由并不能重复
        throw new BusinessException(10004);
      }
    }
  }

  async getMenuItemInfo(id: number) {
    return await this.menuRepository.findOne({ where: { id } });
  }

  /**
   * 保存或新增菜单
   */
  async save(menu: CreateMenuDto & { id?: number }): Promise<void> {
    await this.menuRepository.save(menu);
    // TODO 通过roleIds通知用户更新权限菜单
  }

  /**
   * 查询当前菜单下的子菜单、目录以及菜单
   * @param menuId
   */
  async findChildMenus(menuId: number) {
    const allMenus: any = [];
    const menus = await this.menuRepository.find({
      where: { parentId: menuId },
    });
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].type !== 2) {
        // 子目录下是菜单或目录，继续往下级查询
        const child = await this.findChildMenus(menus[i].id);
        allMenus.push(child);
      }
      allMenus.push(menus[i].id);
    }
    return allMenus;
  }

  async deleteMenuItem(menuIds: number[]): Promise<void> {
    await this.menuRepository.delete(menuIds);
    // TODO 通过menuIds通知用户更新权限菜单
  }

  /**
   * 刷新所有在线用户的权限
   */
  async refreshOnlineUserPerms() {
    const onlineUserIds: string[] = await this.redisService
      .getRedis()
      .keys('admin:token');
    if (onlineUserIds && onlineUserIds.length > 0) {
      for (let i = 0; i < onlineUserIds.length; i++) {
        const uid = onlineUserIds[i].split('admin:token:')[1];
        const perms = await this.getPerms(parseInt(uid));
        await this.redisService
          .getRedis()
          .set(`admin:perms:${uid}`, JSON.stringify(perms));
      }
    }
  }

  async getMenuItemAndParentInfo(
    menuId: number,
  ): Promise<MenuItemAndParentInfoResult> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    let parentMenu: SysMenu | undefined = undefined;
    if (menu && menu.parentId) {
      parentMenu = await this.menuRepository.findOne({
        where: { id: menu.parentId },
      });
    }
    return { menu, parentMenu };
  }
}
