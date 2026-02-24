/* eslint-disable no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@UseGuards(AdminGuard)
@Controller('units/:unitId/schedule')
export class ScheduleController {
  constructor(@Inject(ScheduleService) schedule) {
    this.schedule = schedule;
  }

  @Get()
  async getSchedule(@Param('unitId') unitId) {
    return this.schedule.getSchedule(unitId);
  }

  @Post('slots')
  async upsertSlot(
    @Param('unitId') unitId,
    @Body() body,
  ) {
    const { dayOfWeek, time, modality, classType, durationMinutes } = body;
    return this.schedule.upsertSlot(unitId, dayOfWeek, time, modality, classType, durationMinutes);
  }

  @Delete('slots')
  async deleteSlot(
    @Param('unitId') unitId,
    @Query('dayOfWeek') dayOfWeek,
    @Query('time') time,
  ) {
    return this.schedule.deleteSlot(unitId, dayOfWeek, time);
  }

  @Put('bulk')
  async bulkUpdate(@Param('unitId') unitId, @Body() body) {
    const { slots } = body;
    return this.schedule.bulkUpdateSlots(unitId, slots);
  }
}
