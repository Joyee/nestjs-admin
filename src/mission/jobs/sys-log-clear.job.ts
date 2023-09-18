import { Injectable } from '@nestjs/common';
import { Mission } from '../mission.decorator';
import { SysLogService } from '@/modules/admin/system/log/log.service';

/**
 * 管理后台日志清空任务
 */
@Injectable()
@Mission()
export class SysLogClearJob {
  constructor(private sysLogService: SysLogService) {}

  async clearLoginLog() {
    await this.sysLogService.clearLoginLog();
  }

  async clearTaskLog() {
    await this.sysLogService.clearTaskLog();
  }
}
