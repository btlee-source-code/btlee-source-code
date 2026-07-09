/**
 * Backfill the sequential listing number (`seq`) on existing properties.
 * Run once after deploying the `seq` field: npm run backfill:seq
 *
 * Assigns 1, 2, 3, … to existing listings ordered by creation time, so the
 * oldest listing becomes #1. Then sets the shared 'property' counter to the
 * highest assigned value so newly created listings continue from there.
 *
 * Idempotent: listings that already have a `seq` are left untouched, and the
 * counter is only advanced, never lowered.
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Property } from '../modules/properties/property.model.js';
import { Counter } from '../shared/models/counter.model.js';

async function main(): Promise<void> {
  await connectDatabase();

  // Highest seq already assigned (if the script ran before, or some docs were
  // created after the field was added). New numbers continue above it.
  const highest = await Property.findOne({ seq: { $ne: null } })
    .sort({ seq: -1 })
    .select('seq')
    .lean();

  let next = (highest?.seq ?? 0) + 1;

  // Only docs missing a number, oldest first.
  const toBackfill = await Property.find({ seq: { $in: [null, undefined] } })
    .sort({ createdAt: 1 })
    .select('_id')
    .lean();

  console.log(`Found ${toBackfill.length} listing(s) without a number.`);

  for (const doc of toBackfill) {
    await Property.updateOne({ _id: doc._id }, { $set: { seq: next } });
    next += 1;
  }

  const maxAssigned = next - 1;
  if (maxAssigned >= 1) {
    // Advance the counter only if it's behind the max assigned number.
    await Counter.findByIdAndUpdate(
      'property',
      { $max: { seq: maxAssigned } },
      { upsert: true }
    );
  }

  console.log(`✓ Backfilled ${toBackfill.length} listing(s). Counter at ${maxAssigned}.`);

  await disconnectDatabase();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
