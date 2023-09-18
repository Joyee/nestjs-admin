import { Controller, Query, Post, Body, Get } from '@nestjs/common';
import {
  ApiSecurity,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { isEmpty } from 'lodash';
import { SysTaskService } from './task.service';
import { ADMIN_PREFIX } from '../../admin.constants';
import SysTask from '@/entities/admin/sys-task.entity';
import { PageOptionsDto } from '@/common/dto/page.dto';
import { PaginatedResponseDto } from '@/helper';
import { CheckIdTaskDto, CreateTaskDto, UpdateTaskDto } from './task.dto';
import { BusinessException } from '@/common/exception/business.exception';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('任务调度模块')
@Controller('task')
export class SysTaskController {
  constructor(private readonly taskService: SysTaskService) {}

  @ApiOperation({ summary: '获取任务列表' })
  @ApiOkResponse({ type: [SysTask] })
  @Get('page')
  async page(
    @Query() dto: PageOptionsDto,
  ): Promise<PaginatedResponseDto<SysTask>> {
    const list = await this.taskService.page(dto.page - 1, dto.limit);
    const total = await this.taskService.count();
    return {
      list,
      pagination: {
        total,
        page: dto.page,
        size: dto.limit,
      },
    };
  }

  @ApiOperation({ summary: '获取任务详情' })
  @ApiOkResponse({ type: SysTask })
  @Get('info')
  async info(@Query() dto: CheckIdTaskDto): Promise<SysTask> {
    return await this.taskService.info(dto.id);
  }

  @ApiOperation({ summary: '启动任务' })
  @Post('start')
  async start(@Body() dto: CheckIdTaskDto): Promise<void> {
    const task = await this.taskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.taskService.start(task);
    } else {
      throw new BusinessException(10020);
    }
  }

  @ApiOperation({ summary: '停止任务' })
  @Post('stop')
  async stop(@Body() dto: CheckIdTaskDto): Promise<void> {
    const task = await this.taskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.taskService.stop(task);
    } else {
      throw new BusinessException(10020);
    }
  }

  @ApiOperation({ summary: '手动执行一次' })
  @Post('once')
  async once(@Body() dto: CheckIdTaskDto): Promise<void> {
    const task = await this.taskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.taskService.once(task);
    } else {
      throw new BusinessException(10020);
    }
  }

  @ApiOperation({ summary: '添加任务' })
  @Post('add')
  async add(@Body() dto: CreateTaskDto): Promise<void> {
    const serviceCall = dto.service.split('.');
    await this.taskService.checkHasMissionMeta(serviceCall[0], serviceCall[1]);
    await this.taskService.addOrUpdate(dto);
  }

  @ApiOperation({ summary: '更新任务' })
  @Post('update')
  async update(@Body() dto: UpdateTaskDto): Promise<void> {
    const serviceCall = dto.service.split('.');
    await this.taskService.checkHasMissionMeta(serviceCall[0], serviceCall[1]);
    await this.taskService.addOrUpdate(dto);
  }

  @ApiOperation({ summary: '删除任务' })
  @Post('delete')
  async delete(@Body() dto: CheckIdTaskDto): Promise<void> {
    const task = await this.taskService.info(dto.id);
    if (!isEmpty(task)) {
      await this.taskService.delete(task);
    } else {
      throw new BusinessException(10020);
    }
  }
}
