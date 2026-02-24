/* eslint-disable no-unused-vars */
import { Body, Controller, Post, UseGuards, Inject } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { AdminGuard } from '../common/guards/admin.guard';
import { PresignDto } from './dto/presign.dto';

@Controller('uploads')
export class UploadsController {
  constructor(@Inject(UploadsService) uploads) {
    this.uploads = uploads;
  }

  @UseGuards(AdminGuard)
  @Post('presign')
  async presign(@Body() body) {
    return this.uploads.presignUpload({
      contentType: body?.contentType,
      ext: body?.ext,
      type: body?.type,
    });
  }
}

