import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SysParamConfigService } from './param-config.service';
import SysConfig from '@/entities/admin/sys-config.entity';
import { PageOptionsDto } from '@/common/dto/page.dto';
import { PaginatedResponseDto } from '@/helper';
import { CreateParamConfigDto, DeleteParamConfigDto, InfoParamConfigDto, UpdateParamConfigDto } from './param-config.dto';

@ApiTags('参数配置模块')
@Controller('param-config')
export class SysParamConfigController {
  constructor(private paramConfigService: SysParamConfigService) {}

  @ApiOperation({ summary: '分页获取参数配置列表' })
  @ApiOkResponse({ type: [SysConfig] })
  @Get('page')
  async page(
    @Query() dto: PageOptionsDto,
  ): Promise<PaginatedResponseDto<SysConfig>> {
    const list = await this.paramConfigService.getConfigListWithPagination(
      dto.page - 1,
      dto.limit,
    );
    const count = await this.paramConfigService.countConfigList();
    return {
      pagination: {
        total: count,
        size: dto.limit,
        page: dto.page,
      },
      list,
    };
  }

  @ApiOperation({ summary: '新增参数配置' })
  @Post('add')
  async add(@Body() dto: CreateParamConfigDto): Promise<void> {
    try {
      await this.paramConfigService.isExitKey(dto.key);
      await this.paramConfigService.add(dto);
    } catch (error) {}
  }

  @ApiOperation({ summary: '更新单个参数配置' })
  @Post('update')
  async update(@Body() dto: UpdateParamConfigDto): Promise<void> {
    try {
      await this.paramConfigService.update(dto);
    } catch (error) {}
  }

  @ApiOperation({ summary: '删除单个参数配置' })
  @Post('delete')
  async delete(@Body() dto: DeleteParamConfigDto): Promise<void> {
    await this.paramConfigService.delete(dto.ids);
  }

  @ApiOperation({ summary: '查询单个参数配置信息' })
  @Get('info')
  async info(@Query() dto: InfoParamConfigDto): Promise<SysConfig> {
    return await this.paramConfigService.findOne(dto.id);
  }
}
