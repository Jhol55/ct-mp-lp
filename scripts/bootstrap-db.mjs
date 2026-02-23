import 'dotenv/config';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

async function tableExists(qualifiedName) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT to_regclass('${qualifiedName}')::text as name`,
  );
  const name = rows?.[0]?.name ?? null;
  return !!name;
}

async function main() {
  // Detect whether the database already has objects but isn't baselined yet.
  const hasMigrationsTable = await tableExists('public._prisma_migrations');
  const hasUsersTable = await tableExists('public.users');

  if (!hasMigrationsTable && hasUsersTable) {
    // Baseline the initial migration so Prisma won't try to recreate existing tables.
    // If it's already resolved, Prisma will throw; that's fine.
    try {
      run('npx prisma migrate resolve --applied 0001_init');
    } catch {
      // ignore
    }
  }

  run('npx prisma migrate deploy');
  run('npm run db:seed');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

