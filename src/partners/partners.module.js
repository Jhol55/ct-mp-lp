/* eslint-disable no-unused-vars */
import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService, AdminGuard],
})
export class PartnersModule {}
