/**
 * One-time, idempotent migration for splitting the legacy `finishing` value
 * into independent `finishing` and `furnishing` fields.
 *
 * Legacy mapping:
 *   furnished   -> standard-finished + furnished
 *   unfurnished -> standard-finished + unfurnished
 * Existing condition values keep their finishing and default to unfurnished.
 *
 * Run after deploying the schema: `npm run migrate:property-finishing`
 */
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Property } from '../modules/properties/property.model.js';

async function run(): Promise<void> {
  await connectDatabase();
  const properties = Property.collection;

  const furnished = await properties.updateMany(
    { finishing: 'furnished' },
    [
      {
        $set: {
          finishing: 'standard-finished',
          furnishing: { $ifNull: ['$furnishing', 'furnished'] },
        },
      },
    ]
  );

  const unfurnished = await properties.updateMany(
    { finishing: 'unfurnished' },
    [
      {
        $set: {
          finishing: 'standard-finished',
          furnishing: { $ifNull: ['$furnishing', 'unfurnished'] },
        },
      },
    ]
  );

  const missingFurnishing = await properties.updateMany(
    { furnishing: { $exists: false } },
    { $set: { furnishing: 'unfurnished' } }
  );

  console.log(
    `✓ Property finishing migration complete: ${furnished.modifiedCount} furnished, ` +
      `${unfurnished.modifiedCount} unfurnished, ${missingFurnishing.modifiedCount} defaults.`
  );

  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error('Property finishing migration failed:', error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
