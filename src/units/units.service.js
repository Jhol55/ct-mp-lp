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
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUnit(id) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        modalities: {
          orderBy: { modality: 'asc' },
          include: {
            plans: {
              orderBy: { createdAt: 'asc' },
              include: { prices: { orderBy: { model: 'asc' } } },
            },
          },
        },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async createUnit(name) {
    const clean = String(name ?? '').trim();
    if (!clean) throw new BadRequestException('Name is required');
    
    // Create unit with both modalities
    return this.prisma.unit.create({
      data: {
        name: clean,
        modalities: {
          create: [
            { modality: 'MUAY_THAI' },
            { modality: 'FUNCIONAL' },
          ],
        },
      },
    });
  }

  async updateUnit(id, patch) {
    const data = {};
    if (patch?.name !== undefined) data.name = String(patch.name).trim();
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
    if (patch?.generalNotes !== undefined)
      data.generalNotes = patch.generalNotes ? String(patch.generalNotes).trim() : null;
    if (patch?.trialClassRulesImageUrl !== undefined)
      data.trialClassRulesImageUrl = patch.trialClassRulesImageUrl ? String(patch.trialClassRulesImageUrl) : null;
    if (patch?.trialClassRulesImageKey !== undefined)
      data.trialClassRulesImageKey = patch.trialClassRulesImageKey ? String(patch.trialClassRulesImageKey) : null;
    if (patch?.trialClassRulesText !== undefined)
      data.trialClassRulesText = patch.trialClassRulesText ? String(patch.trialClassRulesText).trim() : null;
    if (patch?.trialClassNotes !== undefined)
      data.trialClassNotes = patch.trialClassNotes ? String(patch.trialClassNotes).trim() : null;
    if (patch?.trialClassSchedulingUrl !== undefined)
      data.trialClassSchedulingUrl = patch.trialClassSchedulingUrl ? String(patch.trialClassSchedulingUrl).trim() : null;
    if (patch?.scheduleExplanationImageUrl !== undefined)
      data.scheduleExplanationImageUrl = patch.scheduleExplanationImageUrl ? String(patch.scheduleExplanationImageUrl) : null;
    if (patch?.scheduleExplanationImageKey !== undefined)
      data.scheduleExplanationImageKey = patch.scheduleExplanationImageKey ? String(patch.scheduleExplanationImageKey) : null;
    if (patch?.scheduleExplanationText !== undefined)
      data.scheduleExplanationText = patch.scheduleExplanationText ? String(patch.scheduleExplanationText).trim() : null;
    if (patch?.rulesImageUrl !== undefined)
      data.rulesImageUrl = patch.rulesImageUrl ? String(patch.rulesImageUrl) : null;
    if (patch?.rulesImageKey !== undefined)
      data.rulesImageKey = patch.rulesImageKey ? String(patch.rulesImageKey) : null;
    if (patch?.rulesText !== undefined)
      data.rulesText = patch.rulesText ? String(patch.rulesText).trim() : null;

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

    // Delete old trial-class rules image from MinIO when a new one is being set
    if (patch?.trialClassRulesImageKey) {
      const existing = await this.prisma.unit.findUnique({
        where: { id },
        select: { trialClassRulesImageKey: true },
      });
      if (existing?.trialClassRulesImageKey && existing.trialClassRulesImageKey !== patch.trialClassRulesImageKey) {
        await this.uploads.deleteObject(existing.trialClassRulesImageKey);
      }
    }

    // Delete old schedule-explanation image from MinIO when a new one is being set
    if (patch?.scheduleExplanationImageKey) {
      const existing = await this.prisma.unit.findUnique({
        where: { id },
        select: { scheduleExplanationImageKey: true },
      });
      if (existing?.scheduleExplanationImageKey && existing.scheduleExplanationImageKey !== patch.scheduleExplanationImageKey) {
        await this.uploads.deleteObject(existing.scheduleExplanationImageKey);
      }
    }

    // Delete old rules image from MinIO when a new one is being set
    if (patch?.rulesImageKey) {
      const existing = await this.prisma.unit.findUnique({
        where: { id },
        select: { rulesImageKey: true },
      });
      if (existing?.rulesImageKey && existing.rulesImageKey !== patch.rulesImageKey) {
        await this.uploads.deleteObject(existing.rulesImageKey);
      }
    }

    try {
      return await this.prisma.unit.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Unit not found');
    }
  }

  async createPlan(modalityId, payload) {
    const name = String(payload?.name ?? '').trim();
    const frequencyLabel = String(payload?.frequencyLabel ?? '').trim();
    if (!name) throw new BadRequestException('Plan name is required');
    if (!frequencyLabel) throw new BadRequestException('frequencyLabel is required');

    // Verify modality exists
    const modality = await this.prisma.unitModality.findUnique({ where: { id: modalityId } });
    if (!modality) throw new NotFoundException('Modality not found');

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
        modalityId,
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
      include: {
        modalities: {
          select: { imageKey: true },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    // Deletar imagens das modalidades do MinIO se existirem
    for (const modality of unit.modalities) {
      if (modality.imageKey) {
        try {
          await this.uploads.deleteObject(modality.imageKey);
        } catch (e) {
          // Log error but don't fail deletion if image deletion fails
          console.error('Failed to delete modality image from MinIO:', e);
        }
      }
    }

    // Deletar imagem de horários do MinIO se existir
    if (unit.scheduleImageKey) {
      try {
        await this.uploads.deleteObject(unit.scheduleImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete schedule image from MinIO:', e);
      }
    }

    // Deletar imagem de regras da aula experimental do MinIO se existir
    if (unit.trialClassRulesImageKey) {
      try {
        await this.uploads.deleteObject(unit.trialClassRulesImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete trial class rules image from MinIO:', e);
      }
    }

    if (unit.scheduleExplanationImageKey) {
      try {
        await this.uploads.deleteObject(unit.scheduleExplanationImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete schedule explanation image from MinIO:', e);
      }
    }

    if (unit.rulesImageKey) {
      try {
        await this.uploads.deleteObject(unit.rulesImageKey);
      } catch (e) {
        // Log error but don't fail deletion if image deletion fails
        console.error('Failed to delete rules image from MinIO:', e);
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

