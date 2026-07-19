/**
 * One-time migration — make the Rating collection domain-ready for cars.
 *
 * The legacy `{ user:1, property:1 }` unique index is NON-partial, so a car
 * rating (which omits `property`) would collide on a null `property` after the
 * user's first car rating. This drops that index and lets Mongoose recreate the
 * PARTIAL versions declared on the schema:
 *   • `{ user, property }`            unique, partial: property exists
 *   • `{ user, targetType, targetId }` unique, partial: targetId exists  (cars)
 *
 * Safe & idempotent: skips the drop if the legacy index is already partial/gone.
 * Run once against production BEFORE deploying car ratings: `npm run migrate:ratings`
 *
 * Standalone-script pattern: connect → work → disconnect.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Rating } from '../modules/ratings/rating.model.js';

async function run(): Promise<void> {
  await connectDatabase();
  const coll = Rating.collection;

  const indexes = await coll.indexes();
  const legacy = indexes.find(
    (i) => i.name === 'user_1_property_1' && !i.partialFilterExpression
  );

  if (legacy) {
    console.log('→ Dropping legacy non-partial index user_1_property_1 …');
    await coll.dropIndex('user_1_property_1');
  } else {
    console.log('✓ No legacy non-partial user_1_property_1 index (nothing to drop).');
  }

  // Build any missing schema indexes (the two partial uniques) and drop stragglers.
  console.log('→ Syncing Rating indexes to the schema …');
  await Rating.syncIndexes();

  const after = await coll.indexes();
  console.log('✓ Done. Current Rating indexes:');
  for (const i of after) {
    console.log(`   • ${i.name}${i.partialFilterExpression ? ' (partial)' : ''}`);
  }

  await disconnectDatabase();
}

run().catch((err) => {
  console.error('Rating index migration failed:', err);
  process.exit(1);
});
