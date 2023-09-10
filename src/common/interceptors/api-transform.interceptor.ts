import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { TRANSFORM_KEEP_KEY_METADATA } from '../constants/decorator.constants';
import { FastifyReply } from 'fastify';
import { ResponseDto } from 'src/helper';

/**
 * 统一处理接口返回结果
 */
@Injectable()
export class ApiTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const keep = this.reflector.get(
          TRANSFORM_KEEP_KEY_METADATA,
          context.getHandler(),
        );
        if (keep) {
          return data;
        }
        const response = context.switchToHttp().getResponse<FastifyReply>();
        response.header('Content-Type', 'application/json; charset=utf-8');
        return new ResponseDto(200, data);
      }),
    );
  }
}
