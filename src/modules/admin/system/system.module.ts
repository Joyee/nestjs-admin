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
import {
  ROOT_ROLE_ID,
  SYS_TASK_QUEUE_NAME,
  SYS_TASK_QUEUE_PREFIX,
} from '@/modules/admin/admin.constants';
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
import { SysOnlineService } from './online/online.service';
import { SysOnlineController } from './online/online.controller';
import { WsModule } from '@/modules/ws/ws.module';
import { SysServeService } from './serve/serve.service';
import { SysServeController } from './serve/serve.controller';
import { SysTaskService } from './task/task.service';
import { SysTaskController } from './task/task.controller';
import SysTask from '@/entities/admin/sys-task.entity';
import SysTaskLog from '@/entities/admin/sys-task-log.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationKeyPaths } from '@/config/configuration';
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
      SysTask,
      SysTaskLog,
    ]),
    WsModule,
    BullModule.registerQueueAsync({
      name: SYS_TASK_QUEUE_NAME,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigurationKeyPaths>) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db'),
        },
        prefix: SYS_TASK_QUEUE_PREFIX,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    SysUserController,
    SysDeptController,
    SysRoleController,
    SysParamConfigController,
    SysLogController,
    SysMenuController,
    SysOnlineController,
    SysServeController,
    SysTaskController,
  ],
  providers: [
    rootRoleIdProvider(),
    SysUserService,
    SysRoleService,
    SysLogService,
    SysParamConfigService,
    SysMenuService,
    SysDeptService,
    SysOnlineService,
    SysServeService,
    SysTaskService,
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
