import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { LoginService } from './login.service';
import { Authorize } from '../core/decorators/authorize.decorator';
import { LogDisabled } from '../core/decorators/log-disabled.decorator';
import { ImageCaptchaDto, LoginInfoDto } from './login.dto';
import { ImageCaptcha, LoginToken } from './login.class';
import { UtilService } from '@/shared/services/util.service';

@ApiTags('登录模块')
@Controller('')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly utilService: UtilService,
  ) {}

  @ApiOperation({ summary: '获取登录图片验证码' })
  @ApiOkResponse({ type: ImageCaptcha })
  @Get('captcha/img')
  @Authorize()
  async captchaByImg(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    return await this.loginService.createImageCaptcha(dto);
  }

  @ApiOperation({ summary: '管理员登录' })
  @ApiOkResponse({ type: LoginToken })
  @Post('login')
  @LogDisabled()
  @Authorize()
  async login(
    @Body() dto: LoginInfoDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<LoginToken> {
    await this.loginService.checkImageCaptcha(dto.captchaId, dto.verifyCode);
    const token = await this.loginService.getLoginSign({
      username: dto.username,
      password: dto.password,
      ip: this.utilService.getReqIP(req),
      ua,
    });
    return { token };
  }
}
