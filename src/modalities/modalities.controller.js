/* eslint-disable no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ModalitiesService } from './modalities.service.js';
import { UnitsService } from '../units/units.service.js';
import { AdminGuard } from '../common/guards/admin.guard.js';

@UseGuards(AdminGuard)
@Controller('units/:unitId/modalities')
export class ModalitiesController {
  constructor(
    @Inject(ModalitiesService) modalities,
    @Inject(UnitsService) units,
  ) {
    this.modalities = modalities;
    this.units = units;
  }

  @Get()
  async list(@Param('unitId') unitId) {
    return this.modalities.listModalities(unitId);
  }

  @Get(':id')
  async get(@Param('id') id) {
    return this.modalities.getModality(id);
  }

  @Patch(':id/image')
  async updateImage(
    @Param('id') id,
    @Body() body,
  ) {
    return this.modalities.updateModalityImage(
      id,
      body?.imageUrl,
      body?.imageKey,
    );
  }

  @Post(':id/plans')
  async createPlan(@Param('id') modalityId, @Body() body) {
    return this.units.createPlan(modalityId, body);
  }

  @Patch(':id/plans/:planId')
  async patchPlan(@Param('planId') planId, @Body() body) {
    return this.units.updatePlan(planId, body);
  }
}
