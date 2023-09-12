import { Module } from '@nestjs/common';
import { SysUserController } from './user/user.controller';
import { SysUserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import SysUser from '@/entities/admin/sys-user.entity';
import SysConfig from '@/entities/admin/sys-config.entity';
import { SysParamConfigService } from './param-config/param-config.service';
import { SysParamConfigController } from './param-config/param-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SysUser, SysConfig])],
  controllers: [SysUserController, SysParamConfigController],
  providers: [SysUserService, SysParamConfigService],
  exports: [SysUserService],
})
export class SystemModule {}
