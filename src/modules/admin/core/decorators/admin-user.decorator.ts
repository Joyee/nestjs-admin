import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ADMIN_USER } from '@/modules/admin/admin.constants';

/**
 * 自定义装饰器: 管理员用户
 */
export const AdminUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // 从执行上下文中获取请求对象
    const request = ctx.switchToHttp().getRequest();
    // auth guard will mount this
    const user = request[ADMIN_USER];

    return data ? user?.[data] : user;
  },
);
