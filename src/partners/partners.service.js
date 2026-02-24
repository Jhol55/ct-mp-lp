/* eslint-disable no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PartnersService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  async listPartners(unitId) {
    return this.prisma.partner.findMany({
      where: { unitId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPartner(unitId, payload) {
    const name = String(payload?.name ?? '').trim();
    if (!name) throw new BadRequestException('Partner name is required');

    const rulesAndNotes = payload?.rulesAndNotes
      ? String(payload.rulesAndNotes).trim()
      : null;

    // Verificar se a unidade existe
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    return this.prisma.partner.create({
      data: {
        unitId,
        name,
        rulesAndNotes: rulesAndNotes || null,
      },
    });
  }

  async updatePartner(partnerId, payload) {
    const existing = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!existing) throw new NotFoundException('Partner not found');

    const data = {};
    if (payload?.name !== undefined) {
      const name = String(payload.name).trim();
      if (!name) throw new BadRequestException('Partner name is required');
      data.name = name;
    }
    if (payload?.rulesAndNotes !== undefined) {
      data.rulesAndNotes = payload.rulesAndNotes
        ? String(payload.rulesAndNotes).trim()
        : null;
    }

    return this.prisma.partner.update({
      where: { id: partnerId },
      data,
    });
  }

  async deletePartner(partnerId) {
    const existing = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!existing) throw new NotFoundException('Partner not found');

    try {
      await this.prisma.partner.delete({ where: { id: partnerId } });
    } catch (e) {
      throw new NotFoundException('Partner not found');
    }
  }
}
