import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SYS_TASK_QUEUE_NAME } from '../../admin.constants';
import { SysTaskService } from './task.service';
import { SysLogService } from '../log/log.service';

export interface ExecuteData {
  id: number;
  args?: string | null;
  service: string;
}

@Processor(SYS_TASK_QUEUE_NAME)
export class SysTaskCustomer {
  constructor(
    private taskService: SysTaskService,
    private taskLogService: SysLogService,
  ) {}

  @Process()
  async handle(job: Job<ExecuteData>): Promise<void> {
    const startTime = Date.now();
    const { data } = job;
    try {
      await this.taskService.callService(data.service, data.args);
      const timing = Date.now() - startTime;
      // 任务执行成功
      await this.taskLogService.recordTaskLog(data.id, 1, timing + '');
    } catch (error) {
      const timing = Date.now() - startTime;
      await this.taskLogService.recordTaskLog(
        data.id,
        0,
        timing + '',
        `${error}`,
      );
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job<ExecuteData>) {
    this.taskService.updateTaskCompleteStatus(job.data.id);
  }
}