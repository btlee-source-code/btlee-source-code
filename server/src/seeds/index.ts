/**
 * Database Seed Script
 * Run with: npm run seed
 *
 * Seeds ONLY the platform admin account (from ADMIN_EMAIL / ADMIN_PASSWORD).
 * No demo users or demo properties are created — the platform runs on real
 * data only. Safe to run more than once; it skips if the admin already exists.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { Admin } from '../modules/admins/admin.model.js';
import { hashPassword } from '../shared/utils/password.js';

async function seedAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.log('⏭  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }

  const existing = await Admin.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`✓ Admin "${env.ADMIN_EMAIL}" already exists`);
    return;
  }

  const hashed = await hashPassword(env.ADMIN_PASSWORD);
  await Admin.create({
    name: 'Bt Lee Admin',
    email: env.ADMIN_EMAIL.toLowerCase(),
    password: hashed,
  });
  console.log(`✓ Admin "${env.ADMIN_EMAIL}" created`);
}

async function main(): Promise<void> {
  await connectDatabase();
  await seedAdmin();
  await disconnectDatabase();
  console.log('\n✅ Seed complete');
  console.log(`\n🔐 Admin account ready: ${env.ADMIN_EMAIL} (password from ADMIN_PASSWORD)`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
