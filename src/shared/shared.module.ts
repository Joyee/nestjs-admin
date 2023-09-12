import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationKeyPaths } from '@/config/configuration';

import { RedisModule } from './redis/redis.module';
import { RedisService } from './services/redis.service';
import { LoggerModule } from './logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { UtilService } from './services/util.service';
/**
 * 全局共享模块
 */

const providers = [UtilService, RedisService];
@Global()
@Module({
  imports: [
    CacheModule.register(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigurationKeyPaths>) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigurationKeyPaths>) => ({
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),
        password: configService.get<string>('redis.password'),
        db: configService.get<number>('redis.db'),
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
  ],
  providers,
  exports: providers,
})
export class SharedModule {}
