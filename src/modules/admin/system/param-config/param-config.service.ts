import SysConfig from '@/entities/admin/sys-config.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParamConfigDto, UpdateParamConfigDto } from './param-config.dto';
import { BusinessException } from '@/common/exception/business.exception';

@Injectable()
export class SysParamConfigService {
  constructor(
    @InjectRepository(SysConfig)
    private configRepository: Repository<SysConfig>,
  ) {}

  async add(dto: CreateParamConfigDto): Promise<void> {
    await this.configRepository.insert(dto);
  }

  async update(dto: UpdateParamConfigDto): Promise<void> {
    await this.configRepository.update(
      { id: dto.id },
      { name: dto.name, value: dto.value, remark: dto.remark },
    );
  }

  async delete(ids: number[]): Promise<void> {
    await this.configRepository.delete(ids);
  }

  /**
   * 查询单个
   * @param id
   */
  async findOne(id: number): Promise<SysConfig> {
    return await this.configRepository.findOne({ where: { id } });
  }

  async findValueByKey(key: string): Promise<string | null> {
    const result = await this.configRepository.findOne({
      where: { key },
      select: ['value'],
    });
    if (result) {
      return result.value;
    }
    return null;
  }

  async isExitKey(key: string): Promise<void | never> {
    const result = await this.configRepository.findOne({ where: { key } });
    if (result) {
      throw new BusinessException(10021);
    }
  }

  /**
   * 查询所有配置
   * @param page
   * @param count
   */
  async getConfigListWithPagination(
    page: number,
    count: number,
  ): Promise<SysConfig[]> {
    return await this.configRepository.find({
      order: { id: 'ASC' },
      take: count,
      skip: page * count,
    });
  }

  /**
   * 获取参数总览
   */
  async countConfigList(): Promise<number> {
    return this.configRepository.count();
  }
}
