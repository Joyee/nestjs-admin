import { HttpException } from '@nestjs/common';
import {
  ErrorCodeMap,
  ErrorCodeMapType,
} from '../constants/business.error.codes';

/**
 * 业务异常
 */
export class BusinessException extends HttpException {
  private errorCode: ErrorCodeMapType;

  constructor(errorCode: ErrorCodeMapType) {
    super(ErrorCodeMap[errorCode], 200);
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCodeMapType {
    return this.errorCode;
  }
}
