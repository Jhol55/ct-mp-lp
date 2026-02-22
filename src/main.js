import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  // Ensure proper shutdown on SIGINT/SIGTERM (Prisma v5+ no longer supports beforeExit on library engine)
  app.enableShutdownHooks();

  const corsOrigin = (config.get('CORS_ORIGIN') ?? '').trim();
  const origins = corsOrigin
    ? corsOrigin
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  app.enableCors({
    origin: origins && origins.length ? origins : true,
    credentials: true,
  });

  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap the application', err);
  process.exit(1);
});
