import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';
import { ApiOkResponsePaginated, PaginatedResponseDto } from '@/helper';
import { LogDisabled } from '../../core/decorators/log-disabled.decorator';
import { LoginLogInfo, TaskLogInfo } from './log.class';
import { SysLogService } from './log.service';
import { PageOptionsDto } from '@/common/dto/page.dto';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('日志模块')
@Controller('log')
export class SysLogController {
  constructor(private logService: SysLogService) {}

  @ApiOperation({ summary: '分页查询登录日志' })
  @ApiOkResponsePaginated(LoginLogInfo)
  @LogDisabled()
  @Get('login/page')
  async loginLogPage(
    @Query() dto: PageOptionsDto,
  ): Promise<PaginatedResponseDto<LoginLogInfo>> {
    const list = await this.logService.pageGetLoginLog(dto.page - 1, dto.limit);
    const count = await this.logService.countLoginLog();
    return {
      list,
      pagination: {
        total: count,
        size: dto.limit,
        page: dto.page,
      },
    };
  }

  @ApiOperation({ summary: '分页查询任务日志' })
  @ApiOkResponsePaginated(TaskLogInfo)
  @Get('task/page')
  async taskLogPage(
    @Query() dto: PageOptionsDto,
  ): Promise<PaginatedResponseDto<TaskLogInfo>> {
    const list = await this.logService.page(dto.page - 1, dto.limit);
    const total = await this.logService.countTaskLog();
    return {
      list,
      pagination: {
        total,
        page: dto.page,
        size: dto.limit,
      },
    };
  }
}
