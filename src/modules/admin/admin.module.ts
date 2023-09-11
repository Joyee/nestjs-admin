import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysUser } from '@/entities/admin/sys-user.entity';
import { LoginModule } from './login/login.module';

@Module({
  imports: [TypeOrmModule.forFeature([SysUser]), LoginModule],
  controllers: [],
  providers: [],
})
export class AdminModule {}
