import {
  DynamicModule,
  Module,
  OnModuleDestroy,
  Provider,
} from '@nestjs/common';
import IORedis, { Redis, Cluster } from 'ioredis';
import { isEmpty } from 'lodash';
import {
  REDIS_MODULE_OPTIONS,
  REDIS_CLIENT,
  REDIS_DEFAULT_CLIENT_KEY,
} from './redis.constants';
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interface';

// OnModuleDestroy 能够在模块销毁时执行一些必要的清理操作
@Module({})
export class RedisModule implements OnModuleDestroy {
  onModuleDestroy() {
    // on destroy
  }

  static register(
    options: RedisModuleOptions | RedisModuleOptions[],
  ): DynamicModule {
    const clientProvider = this.createAsyncProvider();
    return {
      module: RedisModule,
      providers: [
        clientProvider,
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [clientProvider],
    };
  }

  static registerAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const clientProvider = this.createAsyncProvider();
    return {
      module: RedisModule,
      providers: [clientProvider, this.createAsyncClientOptions(options)],
      imports: options.imports ?? [],
      exports: [clientProvider],
    };
  }

  private static createAsyncProvider(): Provider {
    return {
      provide: REDIS_CLIENT,
      useFactory: (
        options: RedisModuleOptions | RedisModuleOptions[],
      ): Map<string, Redis | Cluster> => {
        const clients = new Map<string, Redis | Cluster>();
        if (Array.isArray(options)) {
          options.forEach((opt) => {
            const name = opt.name ?? REDIS_DEFAULT_CLIENT_KEY;
            if (clients.has(name)) {
              throw new Error('Redis Init Error: name must unique');
            }
            clients.set(name, this.createClient(opt));
          });
        } else {
          clients.set(REDIS_DEFAULT_CLIENT_KEY, this.createClient(options));
        }
        return clients;
      },
      inject: [REDIS_MODULE_OPTIONS],
    };
  }

  private static createClient(options: RedisModuleOptions): Redis | Cluster {
    let client = null;
    const { url, cluster, nodes, clusterOptions, onClientReady, ...opts } =
      options;

    // check url
    if (!isEmpty(url)) {
      client = new IORedis(url);
    } else if (cluster) {
      client = new IORedis.Cluster(nodes, clusterOptions);
    } else {
      client = new IORedis(opts);
    }
    if (onClientReady) {
      onClientReady(client);
    }
    return client;
  }

  private static createAsyncClientOptions(options: RedisModuleAsyncOptions) {
    return {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  }
}
