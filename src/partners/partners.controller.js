/* eslint-disable no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { AdminGuard } from '../common/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('units/:unitId/partners')
export class PartnersController {
  constructor(@Inject(PartnersService) partners) {
    this.partners = partners;
  }

  @Get()
  async list(@Param('unitId') unitId) {
    return this.partners.listPartners(unitId);
  }

  @Post()
  async create(@Param('unitId') unitId, @Body() body) {
    return this.partners.createPartner(unitId, body);
  }

  @Patch(':id')
  async patch(@Param('id') id, @Body() body) {
    return this.partners.updatePartner(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id) {
    return this.partners.deletePartner(id);
  }
}
