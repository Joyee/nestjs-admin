import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as packageConfig from '../package.json';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';

export const generateDocument = (app) => {
  const options = new DocumentBuilder()
    .setTitle(packageConfig.name)
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    // JWT鉴权
    .addSecurity(ADMIN_PREFIX, {
      description: '后台管理系统授权',
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/doc', app, document);
};
