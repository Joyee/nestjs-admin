import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ResponseDto } from 'src/helper';
import { BusinessException } from '../exception/business.exception';

@Catch()
export class BusinessExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // check exception
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const code =
      exception instanceof BusinessException
        ? exception.getErrorCode()
        : status;

    const message =
      exception instanceof HttpException ? exception.message : `${exception}`;

    if (status >= 500) {
      console.error(exception, BusinessExceptionFilter.name);
    }
    response.status(status).send(new ResponseDto(code, null, message));
  }
}
