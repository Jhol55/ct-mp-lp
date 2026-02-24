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

  async upsertSlot(unitId, dayOfWeek, time, className) {
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

    const classNameStr = className ? String(className).trim() : null;

    return this.prisma.scheduleSlot.upsert({
      where: {
        unitId_dayOfWeek_time: {
          unitId,
          dayOfWeek: day,
          time: timeStr,
        },
      },
      update: {
        className: classNameStr || null,
      },
      create: {
        unitId,
        dayOfWeek: day,
        time: timeStr,
        className: classNameStr || null,
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
        this.upsertSlot(unitId, slot.dayOfWeek, slot.time, slot.className),
      ),
    );
  }
}
