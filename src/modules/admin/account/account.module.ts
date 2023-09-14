import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { SystemModule } from '@/modules/admin/system/system.module';
import { LoginModule } from '@/modules/admin/login/login.module';

@Module({
  imports: [SystemModule, LoginModule],
  controllers: [AccountController],
})
export class AccountModule {}
