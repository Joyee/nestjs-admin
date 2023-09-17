import { Injectable } from '@nestjs/common';
import * as si from 'systeminformation';
import { Disk, ServeStatInfo } from './serve.class';

@Injectable()
export class SysServeService {
  async getServeStat(): Promise<ServeStatInfo> {
    const versions = await si.versions('node, npm');
    const osInfo = await si.osInfo();
    const cpuInfo = await si.cpu();
    const currentLoadInfo = await si.currentLoad();

    // 计算空间
    const diskListInfo = await si.fsSize();
    const diskInfo = new Disk();
    diskInfo.size = diskListInfo[0].size;
    diskInfo.available = diskListInfo[0].available;
    diskInfo.used = 0;
    diskListInfo.forEach((d) => {
      diskInfo.used += d.used;
    });

    // 内存
    const memInfo = await si.mem();

    return {
      runtime: {
        npmVersion: versions.npm,
        nodeVersion: versions.node,
        os: osInfo.platform,
        arch: osInfo.arch,
      },
      cpu: {
        manufacturer: cpuInfo.manufacturer,
        brand: cpuInfo.brand,
        physicalCores: cpuInfo.physicalCores,
        model: cpuInfo.model,
        speed: cpuInfo.speed,
        rawCurrentLoad: currentLoadInfo.rawCurrentLoad,
        rawCurrentLoadIdle: currentLoadInfo.rawCurrentLoadIdle,
        coresLoad: currentLoadInfo.cpus.map((e) => ({
          rawLoad: e.rawLoad,
          rawLoadIdle: e.rawLoadIdle,
        })),
      },
      disk: diskInfo,
      memory: {
        total: memInfo.total,
        available: memInfo.available,
      },
    };
  }
}
