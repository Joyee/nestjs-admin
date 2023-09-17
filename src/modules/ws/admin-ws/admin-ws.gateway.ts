import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { EVENT_OFFLINE, EVENT_ONLINE } from '../ws.event';

/**
 * Admin WebSocket 网关只做通知操作，不做权限校验
 */
@WebSocketGateway()
export class AdminWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private wss: Server;

  get socketServer(): Server {
    return this.wss;
  }

  constructor(private authService: AuthService) {}

  @SubscribeMessage('message')
  handleMessage() {
    this.wss.emit('message', 'hello');
  }

  handleConnection(client: Socket, ...args: any[]): Promise<void> {
    try {
      this.authService.checkAdminAuthToken(client.handshake?.query?.token);
    } catch (error) {
      client.disconnect();
      return;
    }
    // broadcast online
    client.broadcast.emit(EVENT_ONLINE);
  }

  handleDisconnect(client: any) {
    client.broadcast.emit(EVENT_OFFLINE);
  }

  afterInit(server: any) {
    // TODO
  }
}
