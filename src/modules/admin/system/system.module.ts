import { Module } from '@nestjs/common';
import { SysUserController } from './user/user.controller';
import { SysUserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import SysUser from '@/entities/admin/sys-user.entity';
import SysConfig from '@/entities/admin/sys-config.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import { SysParamConfigService } from './param-config/param-config.service';
import { SysParamConfigController } from './param-config/param-config.controller';
import { SysLogService } from './log/log.service';
import { SysLogController } from './log/log.controller';
import SysLoginLog from '@/entities/admin/sys-login-log.entity';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import { rootRoleIdProvider } from '@/modules/admin/core/provider/root-role-id.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser, SysConfig, SysUserRole, SysLoginLog]),
  ],
  controllers: [SysUserController, SysParamConfigController, SysLogController],
  providers: [
    rootRoleIdProvider(),
    SysUserService,
    SysParamConfigService,
    SysLogService,
  ],
  exports: [ROOT_ROLE_ID, SysUserService, SysLogService],
})
export class SystemModule {}
