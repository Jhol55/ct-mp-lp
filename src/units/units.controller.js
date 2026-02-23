/* eslint-disable no-unused-vars */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { AdminGuard } from '../common/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('units')
export class UnitsController {
  constructor(units) {
    this.units = units;
  }

  @Get()
  async list() {
    return this.units.listUnits();
  }

  @Post()
  async create(@Body() body) {
    return this.units.createUnit(body?.name);
  }

  @Get(':id')
  async get(@Param('id') id) {
    return this.units.getUnit(id);
  }

  @Patch(':id')
  async patch(@Param('id') id, @Body() body) {
    return this.units.updateUnit(id, body);
  }

  @Post(':id/plans')
  async createPlan(@Param('id') id, @Body() body) {
    return this.units.createPlan(id, body);
  }
}

