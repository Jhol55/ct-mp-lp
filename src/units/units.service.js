/* eslint-disable no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UploadsService } from '../uploads/uploads.service.js';

@Injectable()
export class UnitsService {
  constructor(@Inject(PrismaService) prisma, @Inject(UploadsService) uploads) {
    this.prisma = prisma;
    this.uploads = uploads;
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
    if (patch?.address !== undefined)
      data.address = patch.address ? String(patch.address).trim() : null;
    if (patch?.addressNumber !== undefined)
      data.addressNumber = patch.addressNumber ? String(patch.addressNumber).trim() : null;
    if (patch?.neighborhood !== undefined)
      data.neighborhood = patch.neighborhood ? String(patch.neighborhood).trim() : null;
    if (patch?.city !== undefined)
      data.city = patch.city ? String(patch.city).trim() : null;
    if (patch?.state !== undefined)
      data.state = patch.state ? String(patch.state).trim() : null;
    if (patch?.zipCode !== undefined)
      data.zipCode = patch.zipCode ? String(patch.zipCode).trim() : null;
    if (patch?.scheduleImageUrl !== undefined)
      data.scheduleImageUrl = patch.scheduleImageUrl ? String(patch.scheduleImageUrl) : null;
    if (patch?.scheduleImageKey !== undefined)
      data.scheduleImageKey = patch.scheduleImageKey ? String(patch.scheduleImageKey) : null;
    if (patch?.paymentMethods !== undefined)
      data.paymentMethods = patch.paymentMethods ? String(patch.paymentMethods).trim() : null;
    if (patch?.cancellationRules !== undefined)
      data.cancellationRules = patch.cancellationRules ? String(patch.cancellationRules).trim() : null;

    // Delete old image from MinIO when a new one is being set
    if (patch?.plansImageKey) {
      const existing = await this.prisma.unit.findUnique({
        where: { id },
        select: { plansImageKey: true },
      });
      if (existing?.plansImageKey && existing.plansImageKey !== patch.plansImageKey) {
        await this.uploads.deleteObject(existing.plansImageKey);
      }
    }

    // Delete old schedule image from MinIO when a new one is being set
    if (patch?.scheduleImageKey) {
      const existing = await this.prisma.unit.findUnique({
        where: { id },
        select: { scheduleImageKey: true },
      });
      if (existing?.scheduleImageKey && existing.scheduleImageKey !== patch.scheduleImageKey) {
        await this.uploads.deleteObject(existing.scheduleImageKey);
      }
    }

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

    const minAge =
      payload?.minAge !== undefined && payload.minAge !== null && payload.minAge !== ''
        ? Number(payload.minAge)
        : null;
    const maxAge =
      payload?.maxAge !== undefined && payload.maxAge !== null && payload.maxAge !== ''
        ? Number(payload.maxAge)
        : null;

    const notes = payload?.notes ? String(payload.notes).trim() : null;

    return this.prisma.plan.create({
      data: {
        unitId,
        name,
        frequencyLabel,
        minAge: Number.isFinite(minAge) && minAge >= 0 ? minAge : null,
        maxAge: Number.isFinite(maxAge) && maxAge >= 0 ? maxAge : null,
        notes: notes || null,
        prices: createPrices.length ? { create: createPrices } : undefined,
      },
      include: { prices: true },
    });
  }

  async updatePlan(planId, payload) {
    const existing = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!existing) throw new NotFoundException('Plan not found');

    const data = {};
    if (payload?.name !== undefined) {
      const name = String(payload.name).trim();
      if (!name) throw new BadRequestException('Plan name is required');
      data.name = name;
    }
    if (payload?.frequencyLabel !== undefined) {
      const freq = String(payload.frequencyLabel).trim();
      if (!freq) throw new BadRequestException('frequencyLabel is required');
      data.frequencyLabel = freq;
    }
    if (payload?.minAge !== undefined) {
      const minAge =
        payload.minAge !== null && payload.minAge !== ''
          ? Number(payload.minAge)
          : null;
      data.minAge = Number.isFinite(minAge) && minAge >= 0 ? minAge : null;
    }
    if (payload?.maxAge !== undefined) {
      const maxAge =
        payload.maxAge !== null && payload.maxAge !== ''
          ? Number(payload.maxAge)
          : null;
      data.maxAge = Number.isFinite(maxAge) && maxAge >= 0 ? maxAge : null;
    }
    if (payload?.notes !== undefined) {
      data.notes = payload.notes ? String(payload.notes).trim() : null;
    }

    // If prices are provided, replace all existing prices
    if (Array.isArray(payload?.prices)) {
      const newPrices = payload.prices
        .filter((p) => p && p.model && Number.isFinite(Number(p.priceCents)))
        .map((p) => ({
          model: p.model,
          priceCents: Number(p.priceCents),
        }));

      return this.prisma.$transaction(async (tx) => {
        await tx.planPrice.deleteMany({ where: { planId } });
        return tx.plan.update({
          where: { id: planId },
          data: {
            ...data,
            prices: newPrices.length ? { create: newPrices } : undefined,
          },
          include: { prices: true },
        });
      });
    }

    return this.prisma.plan.update({
      where: { id: planId },
      data,
      include: { prices: true },
    });
  }

  async deleteUnit(id) {
    // Buscar a unidade para obter as keys das imagens
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      select: {
        id: true,
        plansImageKey: true,
        scheduleImageKey: true,
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Deletar imagens do MinIO se existirem
    if (unit.plansImageKey) {
      try {
        await this.uploads.deleteObject(unit.plansImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete plans image from MinIO:', e);
      }
    }

    if (unit.scheduleImageKey) {
      try {
        await this.uploads.deleteObject(unit.scheduleImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete schedule image from MinIO:', e);
      }
    }

    // Deletar a unidade (cascade delete cuidará dos planos, slots, etc)
    try {
      await this.prisma.unit.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('Unit not found');
    }
  }
}

