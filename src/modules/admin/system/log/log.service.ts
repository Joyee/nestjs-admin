import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import SysLoginLog from '@/entities/admin/sys-login-log.entity';
import { UtilService } from '@/shared/services/util.service';
import { LoginLogInfo, TaskLogInfo } from './log.class';
import SysUser from '@/entities/admin/sys-user.entity';
import SysTaskLog from '@/entities/admin/sys-task-log.entity';

@Injectable()
export class SysLogService {
  constructor(
    @InjectRepository(SysLoginLog)
    private loginLogRepository: Repository<SysLoginLog>,
    private utilService: UtilService,
    @InjectRepository(SysUser)
    private userRepository: Repository<SysUser>,
    @InjectRepository(SysTaskLog)
    private taskLogRepository: Repository<SysTaskLog>,
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

  async pageGetLoginLog(page: number, count: number): Promise<LoginLogInfo[]> {
    const result = await this.loginLogRepository
      .createQueryBuilder('login_log')
      .innerJoinAndSelect('sys_user', 'user', 'login_log.user_id = user.id')
      .orderBy('login_log_created_at', 'DESC')
      .offset(page * count)
      .limit(count)
      .getRawMany();
    const parser = new UAParser();
    return result.map((e) => {
      const u = parser.setUA(e.login_log_ua).getResult();
      return {
        id: e.login_log_id,
        ip: e.login_log_ip,
        os: `${u.os.name} ${u.os.version}`,
        browser: `${u.browser.name} ${u.browser.version}`,
        time: e.login_log_created_at,
        username: e.user_username,
        loginLocation: e.login_log_login_location,
      };
    });
  }

  /**
   * 计算登录日志日志总数
   * @returns
   */
  async countLoginLog(): Promise<number> {
    const userIds = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .getMany();
    return await this.loginLogRepository.count({
      where: { userId: In(userIds.map((e) => e.id)) },
    });
  }

  /**
   * 记录任务日志
   * @param tid
   * @param status
   * @param time
   * @param err
   * @returns
   */
  async recordTaskLog(
    tid: number,
    status: number,
    time?: string,
    err?: string,
  ) {
    const result = await this.taskLogRepository.save({
      taskId: tid,
      status,
      detail: err,
    });
    return result;
  }

  /**
   * 清空表中所有的数据
   */
  async clearLoginLog() {
    await this.loginLogRepository.clear();
  }

  /**
   * 清空表中所有的数据
   */
  async clearTaskLog() {
    await this.taskLogRepository.clear();
  }

  async page(page: number, count: number): Promise<TaskLogInfo[]> {
    const result = await this.taskLogRepository
      .createQueryBuilder('task_log')
      .leftJoinAndSelect('sys_task', 'task', 'task_log.task_id = task.id')
      .orderBy('task_log.id', 'DESC')
      .offset(page * count)
      .limit(count)
      .getRawMany();
    return result.map((e) => ({
      id: e.task_log_id,
      taskId: e.task_id,
      name: e.task_name,
      createdAt: e.task_log_created_at,
      consumeTime: e.task_log_consume_time,
      detail: e.task_log_detail,
      status: e.task_log_status,
    }));
  }

  async countTaskLog() {
    return await this.taskLogRepository.count();
  }
}
