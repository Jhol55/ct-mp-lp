import { Module } from '@nestjs/common';
import { ModalitiesController } from './modalities.controller.js';
import { ModalitiesService } from './modalities.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UnitsModule } from '../units/units.module.js';

@Module({
  imports: [PrismaModule, UploadsModule, AuthModule, UnitsModule],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
})
export class ModalitiesModule {}
