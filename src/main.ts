import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BusinessExceptionFilter } from './common/filters/business.exception.filter';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new BusinessExceptionFilter());

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  generateDocument(app);

  await app.listen(3000, '0.0.0.0');
  const serviceUrl = await app.getUrl();
  console.log(`api服务已启动，访问: ${serviceUrl}`);
}
bootstrap();
