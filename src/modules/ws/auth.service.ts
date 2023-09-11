import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'lodash';
import { IAdminUser } from '../admin/admin.instance';
import { SocketException } from '../../common/exception/socket.exception';

export class AuthService {
  constructor(private jwtService: JwtService) {}

  checkAdminAuthToken(
    token: string | string[] | undefined,
  ): IAdminUser | never {
    if (isEmpty(token)) {
      throw new SocketException(11001);
    }
    try {
      return this.jwtService.verify(Array.isArray(token) ? token[0] : token);
    } catch (error) {
      throw new SocketException(11001);
    }
  }
}
