import { Injectable } from '@nestjs/common';
import { Mission } from '../mission.decorator';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from 'src/shared/logger/logger.service';

@Injectable()
@Mission()
export class HttpRequestJob {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 发起请求
   * @param config: { AxiosRequestConfig }
   */
  async handle(config: unknown) {
    if (config) {
      const result = await this.httpService.axiosRef.request(config);
      this.logger.log(result, HttpRequestJob.name);
    } else {
      throw new Error('Http request job param is empty');
    }
  }
}
