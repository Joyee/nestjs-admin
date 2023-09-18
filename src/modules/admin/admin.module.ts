import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { LoginModule } from './login/login.module';
import { SystemModule } from './system/system.module';
import { AuthGuard } from './core/guards/auth.guard';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { AccountModule } from './account/account.module';
import { NetdiskModule } from './netdisk/netdisk.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: ADMIN_PREFIX,
        children: [
          {
            path: 'sys',
            module: SystemModule,
          },
          {
            path: 'account',
            module: AccountModule,
          },
          {
            path: 'netdisk',
            module: NetdiskModule,
          },
        ],
      },
      // like this url /admin/captcha/img
      {
        path: ADMIN_PREFIX,
        module: LoginModule,
      },
    ]),
    LoginModule,
    SystemModule,
    AccountModule,
    NetdiskModule,
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
