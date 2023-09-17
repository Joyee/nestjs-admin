import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configServie: ConfigService,
  ) {
    super(app);
  }

  create(
    port: number,
    options?: ServerOptions & { namespace?: string; server?: any },
  ): Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
    port = this.configServie.get<number>('socket.port');
    options.path = this.configServie.get<string>('socket.path');
    options.namespace = '/admin';
    return super.create(port, options);
  }

  createIOServer(port: number, options?: any) {
    port = this.configServie.get<number>('socket.port');
    options.path = this.configServie.get<string>('socket.path');
    options.namespace = '/admin';
    console.log(options);
    return super.createIOServer(port, options);
  }
}
