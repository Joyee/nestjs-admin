import { Module } from '@nestjs/common';
import { SystemModule } from '@/modules/admin/system/system.module';
import { NetManagerService } from './manager/manager.service';
import { NetDiskOverviewService } from './overview/overview.service';
import { NetDiskOverviewController } from './overview/overview.controller';
import { NetDiskManagerController } from './manager/manager.controller';

@Module({
  imports: [SystemModule],
  providers: [NetManagerService, NetDiskOverviewService],
  controllers: [NetDiskOverviewController, NetDiskManagerController],
})
export class NetdiskModule {}
