/* eslint-disable no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UnitsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listUnits() {
    return this.prisma.unit.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        plansImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUnit(id) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        plans: {
          orderBy: { createdAt: 'asc' },
          include: { prices: { orderBy: { model: 'asc' } } },
        },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async createUnit(name) {
    const clean = String(name ?? '').trim();
    if (!clean) throw new BadRequestException('Name is required');
    return this.prisma.unit.create({ data: { name: clean } });
  }

  async updateUnit(id, patch) {
    const data = {};
    if (patch?.name !== undefined) data.name = String(patch.name).trim();
    if (patch?.plansImageUrl !== undefined)
      data.plansImageUrl = patch.plansImageUrl ? String(patch.plansImageUrl) : null;
    if (patch?.plansImageKey !== undefined)
      data.plansImageKey = patch.plansImageKey ? String(patch.plansImageKey) : null;

    try {
      return await this.prisma.unit.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Unit not found');
    }
  }

  async createPlan(unitId, payload) {
    const name = String(payload?.name ?? '').trim();
    const frequencyLabel = String(payload?.frequencyLabel ?? '').trim();
    if (!name) throw new BadRequestException('Plan name is required');
    if (!frequencyLabel) throw new BadRequestException('frequencyLabel is required');

    const prices = Array.isArray(payload?.prices) ? payload.prices : [];
    const createPrices = prices
      .filter((p) => p && p.model && Number.isFinite(Number(p.priceCents)))
      .map((p) => ({
        model: p.model,
        priceCents: Number(p.priceCents),
      }));

    return this.prisma.plan.create({
      data: {
        unitId,
        name,
        frequencyLabel,
        prices: createPrices.length ? { create: createPrices } : undefined,
      },
      include: { prices: true },
    });
  }
}

