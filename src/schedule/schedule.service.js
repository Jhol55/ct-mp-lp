/* eslint-disable no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ScheduleService {
  constructor(@Inject(PrismaService) prisma) {
    this.prisma = prisma;
  }

  async getSchedule(unitId) {
    const slots = await this.prisma.scheduleSlot.findMany({
      where: { unitId },
      orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
    });
    return slots;
  }

  async upsertSlot(unitId, dayOfWeek, time, modality, classType, durationMinutes) {
    const day = Number(dayOfWeek);
    const timeStr = String(time).trim();

    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new BadRequestException(
        'dayOfWeek must be 0-6 (0=Dom, 1=Seg, ..., 6=Sáb)',
      );
    }

    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
      throw new BadRequestException('time must be in format "HH:MM"');
    }

    const modalityStr = modality && ['MUAY_THAI', 'FUNCIONAL'].includes(modality) ? modality : null;
    const classTypeStr = classType && ['ADULTOS', 'KIDS', 'LIVRE'].includes(classType) ? classType : 'LIVRE';
    
    const duration = durationMinutes !== undefined && durationMinutes !== null 
      ? Number(durationMinutes) 
      : 60;
    
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new BadRequestException('durationMinutes must be a positive integer');
    }

    return this.prisma.scheduleSlot.upsert({
      where: {
        unitId_dayOfWeek_time: {
          unitId,
          dayOfWeek: day,
          time: timeStr,
        },
      },
      update: {
        modality: modalityStr,
        classType: classTypeStr,
        durationMinutes: duration,
      },
      create: {
        unitId,
        dayOfWeek: day,
        time: timeStr,
        modality: modalityStr,
        classType: classTypeStr,
        durationMinutes: duration,
      },
    });
  }

  async deleteSlot(unitId, dayOfWeek, time) {
    const day = Number(dayOfWeek);
    const timeStr = String(time).trim();

    try {
      await this.prisma.scheduleSlot.delete({
        where: {
          unitId_dayOfWeek_time: {
            unitId,
            dayOfWeek: day,
            time: timeStr,
          },
        },
      });
      return { success: true };
    } catch {
      throw new NotFoundException('Schedule slot not found');
    }
  }

  async bulkUpdateSlots(unitId, slots) {
    if (!Array.isArray(slots)) {
      throw new BadRequestException('slots must be an array');
    }

    return this.prisma.$transaction(
      slots.map((slot) =>
        this.upsertSlot(unitId, slot.dayOfWeek, slot.time, slot.modality, slot.classType, slot.durationMinutes),
      ),
    );
  }

  async getVisibility(unitId) {
    let visibility = await this.prisma.scheduleVisibility.findUnique({
      where: { unitId },
    });

    if (!visibility) {
      // Criar configuração vazia se não existir
      visibility = await this.prisma.scheduleVisibility.create({
        data: {
          unitId,
          hiddenTimeSlots: [],
        },
      });
    }

    return visibility;
  }

  async updateVisibility(unitId, hiddenTimeSlots) {
    if (!Array.isArray(hiddenTimeSlots)) {
      throw new BadRequestException('hiddenTimeSlots must be an array');
    }

    // Validar formato dos horários
    for (const time of hiddenTimeSlots) {
      if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
        throw new BadRequestException(`Invalid time format: ${time}. Expected "HH:MM"`);
      }
    }

    return this.prisma.scheduleVisibility.upsert({
      where: { unitId },
      update: {
        hiddenTimeSlots,
      },
      create: {
        unitId,
        hiddenTimeSlots,
      },
    });
  }
}
