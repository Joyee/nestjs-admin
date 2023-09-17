import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './common/filters/business.exception.filter';
import { generateDocument } from './doc';
import {
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { LoggerService } from './shared/logger/logger.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationError } from 'class-validator';
import { SocketIoAdapter } from './modules/ws/socket-io.adapter';
import { ConfigService } from '@nestjs/config';
import { getConfig } from './utils';

declare const module: any;

const { WS_CONFIG } = getConfig();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  app.enableCors(); // 允许跨域

  app.useLogger(app.get(LoggerService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(
          errors
            .filter((item) => !!item.constraints)
            .flatMap((item) => Object.entries(item.constraints))
            .join('; '),
        );
      },
    }),
  );
  app.useGlobalFilters(new BusinessExceptionFilter(app.get(LoggerService)));
  // api interceptor
  app.useGlobalInterceptors(new ApiTransformInterceptor(new Reflector()));
  // websocket
  app.useWebSocketAdapter(new SocketIoAdapter(app, app.get(ConfigService)));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  generateDocument(app);

  await app.listen(4000, '0.0.0.0');
  const serviceUrl = await app.getUrl();
  Logger.log(`api服务已启动，请访问: ${serviceUrl}`);
  Logger.log(`API文档已生成，请访问: ${serviceUrl}/doc`);
  Logger.log(
    `ws服务已经启动,请访问: http://localhost:${WS_CONFIG.port}${WS_CONFIG.path}`,
  );
}
bootstrap();
