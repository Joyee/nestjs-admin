import { SetMetadata } from '@nestjs/common';
import { PERMISSION_OPTIONAL_KEY_METADATA } from '@/modules/admin/admin.constants';

/**
 * 使用该注解可开放当前API权限，无需权限访问，但需要验证身份token
 */
export const PermissionOptional = () =>
  SetMetadata(PERMISSION_OPTIONAL_KEY_METADATA, true);
