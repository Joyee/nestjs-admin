import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModuleAsyncOptions } from './logger.instance';
import { LoggerService } from './logger.service';
import { LOGGER_MODULE_OPTIONS } from './logger.constants';

@Module({})
export class LoggerModule {
  static forAsyncRoot(
    options: LoggerModuleAsyncOptions,
    isGlobal = false,
  ): DynamicModule {
    return {
      global: isGlobal,
      imports: options.imports,
      exports: [LoggerService, LOGGER_MODULE_OPTIONS],
      providers: [
        LoggerService,
        {
          provide: LOGGER_MODULE_OPTIONS,
          useFactory: options.useFacotry,
          inject: options.inject,
        },
      ],
      module: LoggerModule,
    };
  }
}
