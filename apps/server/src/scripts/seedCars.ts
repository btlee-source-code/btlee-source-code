/**
 * Seed demo cars — populates the cars collection with realistic dummy listings
 * so the mobile "cars" section can be previewed with real-looking data (and
 * demoed to the client). Run: npm run seed:cars
 *
 * Safe & idempotent: every seeded car is owned by a dedicated demo user
 * (`cars-seed@btlee.local`). Each run first deletes that user's existing cars,
 * then inserts a fresh batch — it never touches real users' data. All cars are
 * created with status 'approved' so they show up on the public endpoints.
 *
 * Standalone-script pattern (see backfillListingSeq.ts): connect → work →
 * disconnect. Relative imports use `.js` extensions (ESM/NodeNext).
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Car } from '../modules/cars/car.model.js';
import { User } from '../modules/users/user.model.js';
import { getNextSequence } from '../shared/models/counter.model.js';

const HOW_MANY = 24;

// Demo dealer that owns every seeded car — isolates seed data from real users.
const SEED_OWNER = {
  name: 'معرض بيت لي',
  email: 'cars-seed@btlee.local',
  authProvider: 'google' as const, // dormant account, no password/login
  emailVerified: false,
};

// A small pool of make/model/body combos common in the Egyptian market.
const MODELS: { make: string; model: string; bodyType: string }[] = [
  { make: 'Toyota', model: 'Corolla', bodyType: 'sedan' },
  { make: 'Toyota', model: 'Fortuner', bodyType: 'suv' },
  { make: 'Hyundai', model: 'Elantra', bodyType: 'sedan' },
  { make: 'Hyundai', model: 'Tucson', bodyType: 'crossover' },
  { make: 'Kia', model: 'Sportage', bodyType: 'crossover' },
  { make: 'Kia', model: 'Cerato', bodyType: 'sedan' },
  { make: 'Nissan', model: 'Sunny', bodyType: 'sedan' },
  { make: 'Nissan', model: 'Qashqai', bodyType: 'crossover' },
  { make: 'Chevrolet', model: 'Optra', bodyType: 'sedan' },
  { make: 'Mercedes-Benz', model: 'C180', bodyType: 'sedan' },
  { make: 'BMW', model: '320i', bodyType: 'sedan' },
  { make: 'Volkswagen', model: 'Golf', bodyType: 'hatchback' },
  { make: 'Renault', model: 'Duster', bodyType: 'suv' },
  { make: 'Peugeot', model: '208', bodyType: 'hatchback' },
  { make: 'Fiat', model: 'Tipo', bodyType: 'sedan' },
  { make: 'MG', model: 'ZS', bodyType: 'crossover' },
  { make: 'Chery', model: 'Tiggo 8', bodyType: 'suv' },
  { make: 'Jeep', model: 'Wrangler', bodyType: 'suv' },
  { make: 'Mitsubishi', model: 'L200', bodyType: 'pickup' },
  { make: 'Honda', model: 'Civic', bodyType: 'sedan' },
];

// Stable Unsplash car photos (any real URL passes the schema; direct create
// bypasses the URL Zod check, but these are valid images for a realistic demo).
const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
  'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200',
  'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200',
];

const GOVERNORATES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الشرقية', 'الدقهلية', 'القليوبية'];
const AREAS = ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'المهندسين', 'الشيخ زايد', '6 أكتوبر', 'سموحة', 'المنصورة'];
const COLORS = ['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق'];
const TRANSMISSIONS = ['automatic', 'manual'] as const;
const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric', 'natural_gas'] as const;
const CONDITIONS = ['new', 'used'] as const;
const LISTING_TYPES = ['sale', 'rent'] as const;

const CURRENT_YEAR = new Date().getFullYear();

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomImages() {
  const count = randomInt(2, 4);
  const shuffled = [...IMAGE_URLS].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((url, i) => ({ publicId: `seed-car-${Date.now()}-${i}-${randomInt(1000, 9999)}`, url }));
}

function randomWhatsapp(): string {
  // 201 + 9 digits → matches the ^201\d{9}$ contract.
  let n = '';
  for (let i = 0; i < 9; i++) n += randomInt(0, 9);
  return `201${n}`;
}

async function main(): Promise<void> {
  await connectDatabase();

  // Reuse or create the demo owner.
  let owner = await User.findOne({ email: SEED_OWNER.email });
  if (!owner) {
    owner = await User.create(SEED_OWNER);
    console.log(`Created demo owner "${SEED_OWNER.name}".`);
  }

  // Idempotent: wipe this demo owner's previous cars before re-seeding.
  const removed = await Car.deleteMany({ owner: owner._id });
  if (removed.deletedCount) {
    console.log(`Removed ${removed.deletedCount} previously seeded car(s).`);
  }

  let created = 0;
  for (let i = 0; i < HOW_MANY; i++) {
    const pick = randomFrom(MODELS);
    const condition = randomFrom(CONDITIONS);
    const isNew = condition === 'new';
    const year = isNew ? randomFrom([CURRENT_YEAR, CURRENT_YEAR + 1]) : randomInt(2010, CURRENT_YEAR - 1);
    const durationDays = randomInt(30, 365);

    const seq = await getNextSequence('car');
    await Car.create({
      seq,
      owner: owner._id,
      listingType: randomFrom(LISTING_TYPES),
      condition,
      make: pick.make,
      model: pick.model,
      year,
      mileage: isNew ? 0 : randomInt(5_000, 220_000),
      transmission: randomFrom(TRANSMISSIONS),
      fuelType: randomFrom(FUEL_TYPES),
      bodyType: pick.bodyType,
      color: randomFrom(COLORS),
      price: randomInt(35, 250) * 10_000, // 350k – 2.5M EGP
      governorate: randomFrom(GOVERNORATES),
      area_name: randomFrom(AREAS),
      description: `${pick.make} ${pick.model} موديل ${year} بحالة ${isNew ? 'الوكالة' : 'ممتازة'}. للتواصل والمعاينة.`,
      images: randomImages(),
      whatsappNumber: randomWhatsapp(),
      durationDays,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      isFeatured: Math.random() < 0.25, // ~25% featured
      status: 'approved', // visible on public endpoints immediately
    });
    created += 1;
  }

  console.log(`✓ Seeded ${created} demo car(s), owned by "${SEED_OWNER.name}".`);

  await disconnectDatabase();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Car seed failed:', err);
  process.exit(1);
});
