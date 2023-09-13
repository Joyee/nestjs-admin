import { Controller } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ADMIN_PREFIX } from '@/modules/admin/admin.constants';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('日志模块')
@Controller('log')
export class SysLogController {}
