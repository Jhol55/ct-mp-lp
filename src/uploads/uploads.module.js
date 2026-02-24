/* eslint-disable no-unused-vars */
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [UploadsService, AdminGuard],
  exports: [UploadsService],
})
export class UploadsModule {}

