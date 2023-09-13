import { FactoryProvider } from '@nestjs/common';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import { ConfigService } from '@nestjs/config';
import { ConfigurationKeyPaths } from '@/config/configuration';

/**
 * 提供使用 @Inject(ROOT_ROLE_ID) 直接获取RootRoleId
 */
export const rootRoleIdProvider = (): FactoryProvider => {
  return {
    provide: ROOT_ROLE_ID,
    useFactory: (configService: ConfigService<ConfigurationKeyPaths>) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return configService.get<number>('rootRoleId', 1);
    },
    inject: [ConfigService],
  };
};
