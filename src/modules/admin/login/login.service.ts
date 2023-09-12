import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { isEmpty } from 'lodash';
import { ImageCaptcha, ImageCaptchaDto } from './login.dto';
import { UtilService } from '@/shared/services/util.service';
import { RedisService } from '@/shared/services/redis.service';
import { BusinessException } from '@/common/exception/business.exception';

@Injectable()
export class LoginService {
  constructor(
    private readonly utilService: UtilService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 创建验证码并存入Redis缓存
   * @param captcha 验证码长宽
   * @returns svg & id object
   */
  async createImageCaptcha(captcha: ImageCaptchaDto): Promise<ImageCaptcha> {
    const svg = svgCaptcha.create({
      width: isEmpty(captcha.width) ? 100 : captcha.width,
      height: isEmpty(captcha.height) ? 50 : captcha.height,
      size: 4,
      color: true,
      noise: 4,
      charPreset: '1234567890',
    });
    const result = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: this.utilService.generateUUID(),
    };
    // 5分钟过期时间
    // 'EX' 表示以秒为单位的过期时间，并且设置为 60 * 5，等于 300 秒，即 5 分钟
    // 存储在 Redis 中的验证码数据将在 5 分钟后自动过期并被删除。
    await this.redisService
      .getRedis()
      .set(`admin:captcha:img:${result.id}`, svg.text, 'EX', 60 * 5);
    return result as ImageCaptcha;
  }

  /**
   * 校验验证码
   * @param id
   * @param code
   */
  async checkImageCaptcha(id: string, code: string): Promise<void> {
    const result = await this.redisService
      .getRedis()
      .get(`admin:captcha:img:${id}`);
    if (
      isEmpty(result) ||
      code.toLocaleLowerCase() !== result.toLocaleLowerCase()
    ) {
      throw new BusinessException(10002);
    }
    // 校验成功后从缓存中移出验证码
    await this.redisService.getRedis().del(`admin:captcha:img:${id}`);
  }

  /**
   * 获取登录 JWT
   */
  async getLoginSign({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<string> {
    const jwtSign = '';
    return jwtSign;
  }
}
