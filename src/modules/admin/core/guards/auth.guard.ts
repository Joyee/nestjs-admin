import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ADMIN_PREFIX,
  ADMIN_USER,
  AUTHORIZE_KEY_METADATA,
  PERMISSION_OPTIONAL_KEY_METADATA,
} from '@/modules/admin/admin.constants';
import { FastifyRequest } from 'fastify';
import { isEmpty } from 'lodash';
import { BusinessException } from '@/common/exception/business.exception';
import { JwtService } from '@nestjs/jwt';
import { LoginService } from '@/modules/admin/login/login.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private loginService: LoginService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检测是否是开放类型的，如果是不需要校验，加入 @Authorize装饰器即可自动放行
    const authorize = this.reflector.get(
      AUTHORIZE_KEY_METADATA,
      context.getHandler(),
    );
    if (authorize) {
      return true;
    }
    const request = await context.switchToHttp().getRequest<FastifyRequest>();
    const url = request.url;
    const path = url.split('?')[0];
    const token = request.headers['authorization'] as string;
    if (isEmpty(token)) {
      throw new BusinessException(11001);
    }

    try {
      // 挂载到当前请求上
      request[ADMIN_USER] = this.jwtService.verify(token);
    } catch (err) {
      // 无法通过校验
      throw new BusinessException(11001);
    }
    if (isEmpty(request[ADMIN_USER])) {
      throw new BusinessException(11001);
    }
    const pv = await this.loginService.getRedisPasswordVersionById(
      request[ADMIN_USER].uid,
    );
    if (pv !== `${request[ADMIN_USER].pv}`) {
      // 密码版本不一致，登录期间已更改过密码
      throw new BusinessException(11002);
    }

    const redisToken = await this.loginService.getRedisTokenById(
      request[ADMIN_USER].uid,
    );
    if (token !== redisToken) {
      throw new BusinessException(11002);
    }

    // 注册该注解，Api则放行检测
    const notNeedPerm = this.reflector.get(
      PERMISSION_OPTIONAL_KEY_METADATA,
      context.getHandler(),
    );
    // token校验身份通过，判断是否需要权限的url，不需要权限则通过
    if (notNeedPerm) {
      return true;
    }

    // 权限标识
    const perms: string = await this.loginService.getRedisPermsById(
      request[ADMIN_USER].uid,
    );
    if (isEmpty(perms)) {
      throw new BusinessException(11001);
    }

    // 将 sys:admin:user 等转换为 sys/admin/user
    const permArray: string[] = (JSON.parse(perms) as string[]).map((e) =>
      e.replace(/:g/, '/'),
    );
    // 遍历权限是否包含该url，不包含就没有权限访问
    if (!permArray.includes(path.replace(`/${ADMIN_PREFIX}/`, ''))) {
      throw new BusinessException(11003);
    }

    return true;
  }
}
