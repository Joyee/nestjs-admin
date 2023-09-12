import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { CreateUserDto } from './user.dto';
import { BusinessException } from '@/common/exception/business.exception';
import { UtilService } from '@/shared/services/util.service';
import { SysParamConfigService } from '../param-config/param-config.service';
import { SYS_USER_INITPASSWORD } from '@/common/constants/param-config.constants';
import SysUser from '@/entities/admin/sys-user.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';

@Injectable()
export class SysUserService {
  constructor(
    @InjectRepository(SysUser) private userRepository: Repository<SysUser>,
    @InjectEntityManager() private entityManager: EntityManager,
    private utilService: UtilService,
    private paramConfigService: SysParamConfigService,
  ) {}

  /**
   * 新增系统用户, 如果返回false,说明已经存在该用户
   * @param params
   */
  async add(params: CreateUserDto): Promise<void> {
    const found = await this.userRepository.findOne({
      where: { username: params.username },
    });
    if (!isEmpty(found)) {
      throw new BusinessException(10001);
    }
    // 设置初始密码123456
    // 用于管理实体对象和数据库之间的交互。EntityManager 提供了一种称为事务（Transaction）的功能，用于在数据库中执行一系列操作，要么全部成功提交，要么全部回滚（撤销），以确保数据库的一致性。
    await this.entityManager.transaction(async (manager) => {
      // 在事务中执行一系列数据库操作
      const salt = this.utilService.generateRandomValue(32);

      // 查找配置的初始密码
      const initPassword = await this.paramConfigService.findValueByKey(
        SYS_USER_INITPASSWORD,
      );
      const password = this.utilService.md5(
        `${initPassword ?? '123456'}${salt}`,
      );
      const u = manager.create(SysUser, {
        departmentId: params.departmentId,
        username: params.username,
        password,
        name: params.name,
        nickName: params.nickName,
        email: params.email,
        remark: params.remark,
        status: params.status,
        psalt: salt,
      });
      const result = await manager.save(u);
      const { roles } = params;
      const insertRoles = roles.map((role) => ({ roleId: role, userId: u.id }));
      // 分配角色
      await manager.insert(SysUserRole, insertRoles);
    });
  }
}
