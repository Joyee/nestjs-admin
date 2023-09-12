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
import { LoginService } from './login.service';
import { Authorize } from '../core/decorators/authorize.decorator';
import { LogDisabled } from '../core/decorators/log-disabled.decorator';
import {
  ImageCaptcha,
  ImageCaptchaDto,
  LoginInfoDto,
  LoginToken,
} from './login.dto';
import { FastifyRequest } from 'fastify';

@ApiTags('登录模块')
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

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
    });
    return { token };
  }
}
