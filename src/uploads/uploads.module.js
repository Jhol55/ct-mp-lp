/* eslint-disable no-unused-vars */
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, AdminGuard],
})
export class UploadsModule {}

