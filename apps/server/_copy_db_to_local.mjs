/**
 * ONE-OFF DEV UTILITY — copy Bt Lee data from Atlas (READ-ONLY) → local mongod.
 *
 * SAFETY (hard constraint: never mutate production):
 *   - The Atlas connection is used for READS ONLY. The only calls on it are
 *     listCollections() and find(). No insert/update/delete/drop ever touches it.
 *   - All writes go to the LOCAL mongod (127.0.0.1:27017) exclusively.
 *
 * Run:  node apps/server/_copy_db_to_local.mjs
 * Temporary — safe to delete after the copy.
 */
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose'; // resolvable from the repo root; bundles the mongodb driver

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Same DNS override the server uses locally — many MENA ISPs drop the SRV
// lookups that mongodb+srv:// needs, surfacing as ECONNREFUSED.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

// Read the Atlas URI straight from .env (never printed to the console).
const envText = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const match = envText.match(/^MONGODB_URI=(.*)$/m);
if (!match) throw new Error('MONGODB_URI not found in apps/server/.env');
const ATLAS_URI = match[1].trim().replace(/^["']|["']$/g, '');

const LOCAL_URI = 'mongodb://127.0.0.1:27017';
const DB = 'btlee_db';

let atlasConn;
let localConn;
try {
  console.log('Connecting to Atlas (read-only) …');
  atlasConn = await mongoose
    .createConnection(ATLAS_URI, { dbName: DB, serverSelectionTimeoutMS: 15000 })
    .asPromise();

  console.log('Connecting to local mongod …');
  localConn = await mongoose
    .createConnection(LOCAL_URI, { dbName: DB, serverSelectionTimeoutMS: 8000 })
    .asPromise();

  const srcDb = atlasConn.db; // native MongoDB Db handle
  const dstDb = localConn.db;

  const collections = (await srcDb.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith('system.'));

  console.log(`\nFound ${collections.length} collections in Atlas "${DB}": ${collections.join(', ')}\n`);

  let grand = 0;
  for (const name of collections) {
    const docs = await srcDb.collection(name).find({}).toArray(); // READ from Atlas
    await dstDb.collection(name).deleteMany({}); // reset LOCAL copy so re-runs are clean (local only)
    if (docs.length) {
      await dstDb.collection(name).insertMany(docs, { ordered: false });
    }
    grand += docs.length;
    console.log(`  ${name.padEnd(24)} → ${docs.length} docs`);
  }

  console.log(`\n✅ Done. Copied ${grand} docs into local "${DB}". Atlas was only read.`);
} catch (err) {
  console.error('\n❌ Copy failed:', err?.message ?? err);
  process.exitCode = 1;
} finally {
  await atlasConn?.close().catch(() => {});
  await localConn?.close().catch(() => {});
}
