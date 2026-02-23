/* eslint-disable no-unused-vars */
import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';

function normalizeExt(ext) {
  const cleaned = String(ext ?? '')
    .trim()
    .toLowerCase()
    .replace(/^\./, '');
  if (!cleaned) return null;
  if (!/^[a-z0-9]+$/.test(cleaned)) return null;
  return cleaned;
}

@Injectable()
export class UploadsService {
  constructor(@Inject(ConfigService) config) {
    this.config = config;

    const endpoint = config.get('S3_ENDPOINT');
    const accessKeyId = config.get('S3_ACCESS_KEY_ID');
    const secretAccessKey = config.get('S3_SECRET_ACCESS_KEY');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      // Defer throwing until method call so app can boot in dev without MinIO.
      this.s3 = null;
      return;
    }

    this.s3 = new S3Client({
      region: config.get('S3_REGION') ?? 'us-east-1',
      endpoint,
      forcePathStyle:
        String(config.get('S3_FORCE_PATH_STYLE') ?? 'true').toLowerCase() ===
        'true',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async presignUpload({ contentType, ext }) {
    const bucket = this.config.get('S3_BUCKET');
    const publicBaseUrl = this.config.get('S3_PUBLIC_BASE_URL');

    if (!this.s3 || !bucket || !publicBaseUrl) {
      throw new BadRequestException(
        'S3/MinIO is not configured (S3_ENDPOINT/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY/S3_BUCKET/S3_PUBLIC_BASE_URL)',
      );
    }

    const safeExt = normalizeExt(ext);
    if (!safeExt) {
      throw new BadRequestException('Invalid file extension');
    }

    const ct = String(contentType ?? '').trim().toLowerCase();
    if (!ct.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    const id = crypto.randomUUID();
    const key = `units/plans/${id}.${safeExt}`;

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: ct,
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 60 * 5 });
    const publicUrl = `${publicBaseUrl.replace(/\/$/, '')}/${key}`;

    return { uploadUrl, publicUrl, key };
  }
}

