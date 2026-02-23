/* eslint-disable no-unused-vars */
import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [UnitsController],
  providers: [UnitsService, AdminGuard],
})
export class UnitsModule {}

