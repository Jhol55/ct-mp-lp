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
export class ModalitiesService {
  constructor(@Inject(PrismaService) prisma, @Inject(UploadsService) uploads) {
    this.prisma = prisma;
    this.uploads = uploads;
  }

  async listModalities(unitId) {
    return this.prisma.modality.findMany({
      where: { unitId },
      orderBy: { modality: 'asc' },
      include: {
        plans: {
          orderBy: { createdAt: 'asc' },
          include: { prices: { orderBy: { model: 'asc' } } },
        },
      },
    });
  }

  async getModality(id) {
    const modality = await this.prisma.modality.findUnique({
      where: { id },
      include: {
        plans: {
          orderBy: { createdAt: 'asc' },
          include: { prices: { orderBy: { model: 'asc' } } },
        },
      },
    });
    if (!modality) throw new NotFoundException('Modality not found');
    return modality;
  }

  async updateModalityImage(modalityId, imageUrl, imageKey) {
    const existing = await this.prisma.modality.findUnique({
      where: { id: modalityId },
      select: { imageKey: true },
    });
    if (!existing) throw new NotFoundException('Modality not found');

    // Delete old image from MinIO when a new one is being set
    if (imageKey && existing.imageKey && existing.imageKey !== imageKey) {
      await this.uploads.deleteObject(existing.imageKey);
    }

    return this.prisma.modality.update({
      where: { id: modalityId },
      data: {
        imageUrl: imageUrl || null,
        imageKey: imageKey || null,
      },
    });
  }

  async deleteModalityImage(modalityId) {
    const existing = await this.prisma.modality.findUnique({
      where: { id: modalityId },
      select: { imageKey: true },
    });
    if (!existing) throw new NotFoundException('Modality not found');

    if (existing.imageKey) {
      await this.uploads.deleteObject(existing.imageKey);
    }

    return this.prisma.modality.update({
      where: { id: modalityId },
      data: {
        imageUrl: null,
        imageKey: null,
      },
    });
  }
}
