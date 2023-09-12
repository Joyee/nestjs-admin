import { Inject, Injectable } from '@nestjs/common';
import { Redis, Cluster } from 'ioredis';
import { REDIS_CLIENT, REDIS_DEFAULT_CLIENT_KEY } from '../redis/redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly clients: Map<string, Redis | Cluster>,
  ) {}

  public getRedis(name = REDIS_DEFAULT_CLIENT_KEY): Redis {
    if (!this.clients.has(name)) {
      throw new Error(`redis client ${name} does not exits!`);
    }
    return this.clients.get(name) as Redis;
  }
}
