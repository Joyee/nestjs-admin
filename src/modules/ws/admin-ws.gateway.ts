import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';

@WebSocketGateway()
export class AdminWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  afterInit(server: any) {}
  handleConnection(client: any, ...args: any[]) {}
  handleDisconnect(client: any) {}
}
