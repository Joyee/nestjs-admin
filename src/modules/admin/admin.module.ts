import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import SysUser from '@/entities/admin/sys-user.entity';
import SysConfig from '@/entities/admin/sys-config.entity';
import { LoginModule } from './login/login.module';
import { SystemModule } from './system/system.module';
import { AuthGuard } from './core/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([SysUser, SysConfig]),
    LoginModule,
    SystemModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [SystemModule],
})
export class AdminModule {}
