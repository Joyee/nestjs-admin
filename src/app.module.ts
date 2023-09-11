import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigurationKeyPaths,
  getConfiguration,
} from './config/configuration';
import { AdminModule } from './modules/admin/admin.module';
import { SharedModule } from '@/shared/shared.module';
import { LoggerModule } from '@/shared/logger/logger.module';
import { TypeORMLoggerService } from '@/shared/logger/typeorm-logger.service';
import {
  LoggerModuleOptions,
  WinstonLogLevel,
} from '@/shared/logger/logger.instance';
import { LOGGER_MODULE_OPTIONS } from '@/shared/logger/logger.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ignoreEnvFile: true,
      load: [getConfiguration],
      envFilePath: [`.config/.${process.env.NODE_ENV}.yaml`],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService<ConfigurationKeyPaths>,
        loggerOptions: LoggerModuleOptions,
      ) => {
        return {
          autoLoadEntities: true,
          type: configService.get<any>('database.type'),
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          database: configService.get<string>('database.database'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          synchronize: configService.get<boolean>('database.synchronize'),
          timezone: configService.get<string>('database.timezone'),
          logger: new TypeORMLoggerService(
            configService.get('database.logging'),
            loggerOptions,
          ),
        };
      },
      inject: [ConfigService, LOGGER_MODULE_OPTIONS],
    }),
    LoggerModule.forAsyncRoot({
      imports: [ConfigModule],
      useFacotry: (configService: ConfigService) => ({
        level: configService.get<WinstonLogLevel>('logger.level'),
        consoleLevel: configService.get<WinstonLogLevel>('logger.consoleLevel'),
        timestamp: configService.get<boolean>('logger.timestamp'),
        maxFiles: configService.get<string>('logger.maxFiles'),
        maxFileSize: configService.get<string>('logger.maxFileSize'),
        disableConsoleAtProd: configService.get<boolean>(
          'logger.disableConsoleAtProd',
        ),
        dir: configService.get<string>('logger.dir'),
        errorLogName: configService.get<string>('logger.errorLogName'),
        appLogName: configService.get<string>('logger.appLogName'),
      }),
    }),
    SharedModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
