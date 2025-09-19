import { seedAdminUser } from './admin-user.seed';

async function runAllSeeds(): Promise<void> {
  try {
    await seedAdminUser();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

runAllSeeds();
