import { Injectable } from '@nestjs/common';
import { AdminWsGateway } from './admin-ws.gateway';
import { RemoteSocket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminWsService {
  constructor(
    private adminWsGateway: AdminWsGateway,
    private jwtService: JwtService,
  ) {}

  async getOnlineSockets() {
    return await this.adminWsGateway.socketServer.fetchSockets();
  }

  /**
   * 根据uid查询socketid
   */
  async findSocketIdByUid(
    uid: number,
  ): Promise<RemoteSocket<unknown, unknown>> {
    const onlineSockets = await this.getOnlineSockets();
    const socket = onlineSockets.find((socket) => {
      const token = socket.handshake.query?.token as string;
      const tokenUid = this.jwtService.verify(token).uid;
      return tokenUid === uid;
    });
    return socket;
  }
}
