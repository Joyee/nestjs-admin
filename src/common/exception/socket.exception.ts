import { WsException } from '@nestjs/websockets';
import { ErrorCodeMap } from '../constants/business.error.codes';

export class SocketException extends WsException {
  private errorCode: number;

  constructor(errorCode: number) {
    super(ErrorCodeMap[errorCode]);
    this.errorCode = errorCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
