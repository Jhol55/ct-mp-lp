/* eslint-disable no-unused-vars */
import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller.js';
import { ScheduleService } from './schedule.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService, AdminGuard],
})
export class ScheduleModule {}
