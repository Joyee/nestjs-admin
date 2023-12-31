import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { camelCase, isEmpty } from 'lodash';
import {
  CreateUserDto,
  PageSearchUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UpdateUserInfoDto,
} from './user.dto';
import { BusinessException } from '@/common/exception/business.exception';
import { UtilService } from '@/shared/services/util.service';
import { SysParamConfigService } from '../param-config/param-config.service';
import { SYS_USER_INITPASSWORD } from '@/common/constants/param-config.constants';
import SysUser from '@/entities/admin/sys-user.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import { ROOT_ROLE_ID } from '@/modules/admin/admin.constants';
import SysDepartment from '@/entities/admin/sys-department.entity';
import { AccountInfo, PageSearchUserInfo } from './user.class';
import { RedisService } from '@/shared/services/redis.service';

@Injectable()
export class SysUserService {
  constructor(
    @InjectRepository(SysUser) private userRepository: Repository<SysUser>,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    private paramConfigService: SysParamConfigService,
    @InjectRepository(SysDepartment)
    private departmentRepository: Repository<SysDepartment>,
    @InjectEntityManager() private entityManager: EntityManager,
    @Inject(ROOT_ROLE_ID) private rootRoleId: number,
    private utilService: UtilService,
    private redisService: RedisService,
  ) {}

  /**
   * 获取用户信息
   * @param uid
   * @param ip
   */
  async getAccountInfo(uid: number, ip?: string): Promise<AccountInfo> {
    const foundUser: SysUser = await this.userRepository.findOne({
      where: { id: uid },
    });
    if (isEmpty(foundUser)) {
      throw new BusinessException(10017);
    }
    return {
      name: foundUser.name,
      nickName: foundUser.nickName,
      email: foundUser.email,
      phone: foundUser.phone,
      remark: foundUser.remark,
      headImg: foundUser.headImg,
      loginIp: ip,
    };
  }

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
        phone: params.phone,
        remark: params.remark,
        status: params.status,
        psalt: salt,
      });
      await manager.save(u);
      const { roles } = params;
      const insertRoles = roles.map((role) => ({ roleId: role, userId: u.id }));
      // 分配角色
      await manager.insert(SysUserRole, insertRoles);
    });
  }

  /**
   * 更新用户信息
   * @param params
   */
  async update(params: UpdateUserDto): Promise<void> {
    await this.entityManager.transaction(async (manager) => {
      await manager.update(SysUser, params.id, {
        departmentId: params.departmentId,
        username: params.username,
        name: params.name,
        nickName: params.nickName,
        email: params.email,
        phone: params.phone,
        remark: params.remark,
        status: params.status,
      });
      // 删除原来的角色关系
      await manager.delete(SysUserRole, { userId: params.id });
      const insertRoles = params.roles.map((roleId) => ({
        roleId,
        userId: params.id,
      }));
      // 重新配置角色
      await manager.insert(SysUserRole, insertRoles);
      if (params.status === 0) {
        await this.forbidden(params.id);
      }
    });
  }

  async delete(userIds: number[]): Promise<void | never> {
    const rootUserId = await this.findRootUserId();
    if (userIds.includes(rootUserId)) {
      throw new Error('不能删除超级管理员!');
    }
    await this.userRepository.delete(userIds);
    await this.userRoleRepository.delete({ userId: In(userIds) });
  }

  /**
   * 查找超管的用户id
   */
  async findRootUserId(): Promise<number> {
    const result = await this.userRoleRepository.findOne({
      where: { id: this.rootRoleId },
    });
    return result.userId;
  }

  /**
   * 根据用户名查找已启用的用户
   * @param username
   */
  async findUserByUserName(username: string): Promise<SysUser | undefined> {
    return await this.userRepository.findOne({
      where: { username: username, status: 1 },
    });
  }

  /**
   * 查找用户信息
   * @param userId 用户id
   */
  async info(
    userId: number,
  ): Promise<SysUser & { roles: number[]; departmentName: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (isEmpty(user)) {
      throw new BusinessException(10017);
    }
    const departmentRow = await this.departmentRepository.findOne({
      where: { id: user.departmentId },
    });
    if (isEmpty(departmentRow)) {
      throw new BusinessException(10018);
    }
    const roleRows = await this.userRoleRepository.find({
      where: { userId: user.id },
    });
    const roles = roleRows.map((role) => role.roleId);
    delete user.password;
    return { ...user, roles, departmentName: departmentRow.name };
  }

  async infoList(ids: number[]): Promise<SysUser[]> {
    return await this.userRepository.findBy({ id: In(ids) });
  }

  /**
   * 根据部门id列表获取用户数量，去除超级管理员
   * @param uid
   * @param deptIds
   */
  async count(uid: number, deptIds: number[]): Promise<number> {
    const queryAll = isEmpty(deptIds);
    const rootUserId = await this.findRootUserId();
    if (queryAll) {
      return await this.userRepository.count({
        where: { id: Not(In([rootUserId, uid])) },
      });
    }
    return await this.userRepository.count({
      where: { id: Not(In([rootUserId, uid])), departmentId: In(deptIds) },
    });
  }

  /**
   * 根据部门id进行分页查询用户列表，deptId = -1时查询全部
   * @param uid
   * @param params
   */
  async listWithPagination(
    uid: number,
    params: PageSearchUserDto,
  ): Promise<[PageSearchUserInfo[], number]> {
    const { departmentIds, name, username, remark, phone, limit, page } =
      params;

    const rootUserId = await this.findRootUserId();
    const queryAll = isEmpty(departmentIds);
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'sys_department',
        'dept',
        'dept.id = user.departmentId',
      )
      .innerJoinAndSelect(
        'sys_user_role',
        'user_role',
        'user_role.user_id = user.id',
      )
      .innerJoinAndSelect('sys_role', 'role', 'role.id = user_role.role_id')
      .select([
        'user.id,GROUP_CONCAT(role.name) as roleNames',
        'dept.name',
        'user.*',
      ])
      .where('user.id NOT IN (:...ids)', { ids: [rootUserId, uid] })
      .andWhere(queryAll ? '1 = 1' : 'user.departmentId IN (:...deptIds)', {
        deptIds: departmentIds,
      });
    if (!isEmpty(name)) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }
    if (!isEmpty(username)) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }
    if (!isEmpty(phone)) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }
    if (!isEmpty(remark)) {
      queryBuilder.andWhere('user.remark LIKE :remark', {
        remark: `%${remark}%`,
      });
    }

    queryBuilder
      .orderBy('user.updated_at', 'DESC')
      .groupBy('user.id')
      .offset((page - 1) * limit)
      .limit(limit);

    const [_, total] = await queryBuilder.getManyAndCount();
    const list = await queryBuilder.getRawMany();
    const result: PageSearchUserInfo[] = list.map((n) => {
      const convertData = Object.entries<[string, any]>(n).map(
        ([key, value]) => [camelCase(key), value],
      );

      return {
        ...Object.fromEntries(convertData),
        departmentName: n.dept_name,
        roleNames: n.roleNames.split(','),
      };
    });
    return [result, total];
  }

  /**
   * 禁用用户
   */
  async forbidden(uid: number): Promise<void> {
    await this.redisService.getRedis().del(`admin:passwordVersion:${uid}`);
    await this.redisService.getRedis().del(`admin:token:${uid}`);
    await this.redisService.getRedis().del(`admin:perms:${uid}`);
  }

  /**
   * 禁用多个用户
   */
  async multiForbidden(uids: number[]): Promise<void> {
    if (uids && uids.length > 0) {
      const pms: string[] = [];
      const tokens: string[] = [];
      const pvs: string[] = [];
      uids.forEach((uid) => {
        pvs.push(`admin:passwordVersion:${uid}`);
        tokens.push(`admin:token:${uid}`);
        pms.push(`admin:perms:${uid}`);
      });
      await this.redisService.getRedis().del(pvs);
      await this.redisService.getRedis().del(tokens);
      await this.redisService.getRedis().del(pms);
    }
  }

  async forceUpdatePassword(uid: number, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (isEmpty(user)) {
      throw new BusinessException(10017);
    }
    const newPassword = this.utilService.md5(`${password}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password: newPassword });
    await this.upgradePassword(uid);
  }

  /**
   * 更改管理员密码
   * @param uid
   * @param dto
   */
  async updatePassword(uid: number, dto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!isEmpty(user)) {
      throw new BusinessException(10017);
    }
    const comparePassword = this.utilService.md5(
      `${dto.originPassword}${user.psalt}`,
    );
    // 和原密码比较
    if (comparePassword !== user.password) {
      throw new BusinessException(10011);
    }
    const newPassword = this.utilService.md5(`${dto.newPassword}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password: newPassword });
    await this.upgradePassword(uid);
  }

  /**
   * 升级用户版本密码
   */
  async upgradePassword(id: number) {
    const version = await this.redisService
      .getRedis()
      .get(`admin:passwordVersion:${id}`);
    if (!isEmpty(version)) {
      await this.redisService
        .getRedis()
        .set(`admin:passwordVersion:${id}`, parseInt(version) * 1);
    }
  }

  /**
   * 更新个人信息
   */
  async updatePersonalInfo(uid: number, info: UpdateUserInfoDto) {
    await this.userRepository.update(uid, info);
  }
}
