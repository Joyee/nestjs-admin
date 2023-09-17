import { Module } from '@nestjs/common';
import { AdminWsGateway } from './admin-ws/admin-ws.gateway';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWsService } from './admin-ws/admin-ws.service';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import SysRoleMenu from '@/entities/admin/sys-role-menu.entity';

/**
 * Websocket Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([SysUserRole, SysRoleMenu])],
  providers: [AdminWsGateway, AuthService, AdminWsService],
  exports: [AdminWsGateway, AuthService, AdminWsService],
})
export class WsModule {}
