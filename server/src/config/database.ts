/**
 * MongoDB Connection Manager
 * Handles connecting to MongoDB with Mongoose, retries on failure,
 * and graceful disconnection on app shutdown.
 *
 * DNS override: many ISPs (especially in MENA) silently block or drop the
 * SRV-record lookups that `mongodb+srv://` URIs require, which surfaces as
 * `ECONNREFUSED` even when Atlas itself is reachable. Pointing Node at
 * Google + Cloudflare DNS sidesteps that.
 */
import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// DNS override is only needed for local dev behind ISPs that block SRV
// lookups. In production (Railway/Render/etc.) the platform's own resolver
// works fine and forcing public DNS can slow down or break connections, so
// only apply it outside production.
if (env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
}
mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully');
}
