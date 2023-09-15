import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
import {
  CreateDeptDto,
  DeleteDeptDto,
  DeptDetailDto,
  InfoDeptDto,
  MoveDeptDto,
  TransferDeptDto,
  UpdateDeptDto,
} from './dept.dto';
import { IAdminUser } from '../../admin.instance';
import { BusinessException } from '@/common/exception/business.exception';

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

  @ApiOperation({ summary: '新增系统部门' })
  @Post('add')
  async add(
    @Body() dto: CreateDeptDto,
    @AdminUser() user: IAdminUser,
  ): Promise<void> {
    await this.deptService.add(dto);
  }

  @ApiOperation({ summary: '更新系统部门' })
  @Post('update')
  async update(
    @Body() dto: UpdateDeptDto,
    @AdminUser() user: IAdminUser,
  ): Promise<void> {
    await this.deptService.update(dto);
  }

  @ApiOperation({ summary: '删除系统部门' })
  @Post('delete')
  async delete(@Body() dto: DeleteDeptDto): Promise<void> {
    // 查询是否有关联用户或者部门，有就无法删除
    const userCount = await this.deptService.countUserByDepartmentId(
      dto.departmentId,
    );
    if (userCount > 0) {
      throw new BusinessException(10009);
    }
    const roleCount = await this.deptService.countRoleByDepartementId(
      dto.departmentId,
    );
    if (roleCount > 0) {
      throw new BusinessException(10010);
    }

    const childrenCount = await this.deptService.countChildrenDepartment(
      dto.departmentId,
    );
    if (childrenCount) {
      throw new BusinessException(10015);
    }

    await this.deptService.delete(dto.departmentId);
  }

  @ApiOperation({ summary: '查询单个系统部门的信息' })
  @ApiOkResponse({ type: DeptDetailDto })
  @Get('info')
  async info(@Query() dto: InfoDeptDto): Promise<DeptDetailDto> {
    return await this.deptService.info(dto.departmentId);
  }

  @ApiOperation({ summary: '管理员部门转移' })
  @Post('transfer')
  async transfer(@Body() dto: TransferDeptDto): Promise<void> {
    await this.deptService.transfer(dto.userIds, dto.departmentId);
  }

  @ApiOperation({ summary: '部门移动排序' })
  @Post('move')
  async move(@Body() dto: MoveDeptDto): Promise<void> {
    await this.deptService.move(dto.depts);
  }
}
