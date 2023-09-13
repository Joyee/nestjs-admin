import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SysLoginLog from '@/entities/admin/sys-login-log.entity';
import { Repository } from 'typeorm';
import { UtilService } from '@/shared/services/util.service';

@Injectable()
export class SysLogService {
  constructor(
    @InjectRepository(SysLoginLog)
    private loginLogRepository: Repository<SysLoginLog>,
    private utilService: UtilService,
  ) {}

  /**
   * 记录登录日志
   */
  async saveLoginLog(uid: number, ip: string, ua: string) {
    const loginLocation = await this.utilService.getLocation(
      ip.split(',').at(-1).trim(),
    );
    await this.loginLogRepository.save({
      ip,
      loginLocation,
      userId: uid,
      ua,
    });
  }
}
