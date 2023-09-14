import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_PREFIX } from '../../admin.constants';
import { SysDeptService } from './dept.service';
import SysDepartment from '@/entities/admin/sys-department.entity';
import { AdminUser } from '../../core/decorators/admin-user.decorator';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('部门模块')
@Controller('dept')
export class SysDeptController {
  constructor(private deptService: SysDeptService) {}

  @ApiOperation({ summary: '获取系统部门列表' })
  @ApiOkResponse({ type: [SysDepartment] })
  @Get('list')
  async list(@AdminUser('uid') uid: number): Promise<SysDepartment[]> {
    return await this.deptService.getDepts(uid);
  }
}
