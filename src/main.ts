import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './common/filters/business.exception.filter';
import { generateDocument } from './doc';
import { Logger } from '@nestjs/common';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';
import { LoggerService } from './shared/logger/logger.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 允许跨域
  app.useGlobalFilters(new BusinessExceptionFilter(app.get(LoggerService)));
  // api interceptor
  app.useGlobalInterceptors(new ApiTransformInterceptor(new Reflector()));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  generateDocument(app);

  await app.listen(3000, '0.0.0.0');
  const serviceUrl = await app.getUrl();
  Logger.log(`api服务已启动，请访问: ${serviceUrl}`);
  Logger.log(`API文档已生成，请访问: ${serviceUrl}/doc`);
}
bootstrap();
