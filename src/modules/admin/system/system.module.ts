import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SysUser from '@/entities/admin/sys-user.entity';
import SysConfig from '@/entities/admin/sys-config.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import SysLoginLog from '@/entities/admin/sys-login-log.entity';
import SysRole from '@/entities/admin/sys-role.entity';
import SysMenu from '@/entities/admin/sys-menu.entity';
import SysRoleMenu from '@/entities/admin/sys-role-menu.entity';
import SysDepartment from '@/entities/admin/sys-department.entity';
import SysRoleDepartment from '@/entities/admin/sys-role-department.entity';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import { rootRoleIdProvider } from '@/modules/admin/core/provider/root-role-id.provider';
import { SysRoleController } from '@/modules/admin/system/role/role.controller';
import { SysRoleService } from '@/modules/admin/system/role/role.service';
import { SysMenuController } from '@/modules/admin/system/menu/menu.controller';
import { SysMenuService } from '@/modules/admin/system/menu/menu.service';
import { SysUserController } from './user/user.controller';
import { SysUserService } from './user/user.service';
import { SysParamConfigService } from './param-config/param-config.service';
import { SysParamConfigController } from './param-config/param-config.controller';
import { SysLogService } from './log/log.service';
import { SysLogController } from './log/log.controller';
import { SysDeptController } from './dept/dept.controller';
import { SysDeptService } from './dept/dept.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SysUser,
      SysDepartment,
      SysUserRole,
      SysMenu,
      SysRoleMenu,
      SysRole,
      SysRoleDepartment,
      SysLoginLog,
      SysConfig,
    ]),
  ],
  controllers: [
    SysUserController,
    SysDeptController,
    SysRoleController,
    SysParamConfigController,
    SysLogController,
    SysMenuController,
  ],
  providers: [
    rootRoleIdProvider(),
    SysUserService,
    SysRoleService,
    SysLogService,
    SysParamConfigService,
    SysMenuService,
    SysDeptService,
  ],
  exports: [
    ROOT_ROLE_ID,
    TypeOrmModule,
    SysUserService,
    SysLogService,
    SysMenuService,
  ],
})
export class SystemModule {}
