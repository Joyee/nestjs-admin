import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWsGateway } from './admin-ws.gateway';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import { AuthService } from './auth.service';
import { AdminWsService } from './admin-ws.service';

const providers = [AdminWsGateway, AuthService, AdminWsService];

@Module({
  imports: [TypeOrmModule.forFeature([SysUserRole])],
  providers,
  exports: providers,
})
export class WsModule {}
