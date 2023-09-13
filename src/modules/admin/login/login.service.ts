import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { isEmpty } from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { ImageCaptcha } from './login.class';
import { ImageCaptchaDto } from './login.dto';
import { UtilService } from '@/shared/services/util.service';
import { RedisService } from '@/shared/services/redis.service';
import { BusinessException } from '@/common/exception/business.exception';
import { SysUserService } from '@/modules/admin/system/user/user.service';
import { SysLogService } from '@/modules/admin/system/log/log.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly utilService: UtilService,
    private readonly redisService: RedisService,
    private readonly userService: SysUserService,
    private readonly jwtService: JwtService,
    private readonly logService: SysLogService,
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
   * 返回 null 说明登录账号密码错误，不存在该用户
   */
  async getLoginSign({
    username,
    password,
    ip,
    ua,
  }: {
    username: string;
    password: string;
    ip: string;
    ua: string;
  }): Promise<string> {
    const foundUser = await this.userService.findUserByUserName(username);
    if (isEmpty(foundUser)) {
      throw new BusinessException(10003);
    }
    const comparePassword = this.utilService.md5(
      `${password}${foundUser.psalt}`,
    );
    if (foundUser.password !== comparePassword) {
      throw new BusinessException(10003);
    }
    // TODO 系统管理员开放多点登录

    const jwtSign = this.jwtService.sign({
      uid: parseInt(foundUser.id.toString()),
      pv: 1,
    });

    await this.redisService
      .getRedis()
      .set(`admin:passwordVersion:${foundUser.id}`, 1);
    // Token设置过期时间为 24h
    await this.redisService
      .getRedis()
      .set(`admin:token:${foundUser.id}`, jwtSign, 'EX', 60 * 60 * 24);
    await this.logService.saveLoginLog(foundUser.id, ip, ua);
    return jwtSign;
  }

  async getRedisPasswordVersionById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:passwordVersion:${id}`);
  }

  async getRedisTokenById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:token:${id}`);
  }

  async getRedisPermsById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:perms:${id}`);
  }
}
