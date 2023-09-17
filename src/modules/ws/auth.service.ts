import { Injectable } from '@nestjs/common';
import { IAdminUser } from '../admin/admin.instance';
import { isEmpty } from 'lodash';
import { BusinessException } from '@/common/exception/business.exception';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  checkAdminAuthToken(
    token: string | string[] | undefined,
  ): IAdminUser | never {
    if (isEmpty(token)) {
      throw new BusinessException(11001);
    }

    try {
      // 挂载对象到当前请求上
      return this.jwtService.verify(Array.isArray(token) ? token[0] : token);
    } catch (error) {
      throw new BusinessException(11001);
    }
  }
}
