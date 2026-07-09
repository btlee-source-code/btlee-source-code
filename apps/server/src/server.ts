/**
 * Server Entry Point
 * Connects to the database, then starts the HTTP server.
 * Handles graceful shutdown on SIGTERM / SIGINT.
 */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { startJobs, stopJobs } from './jobs/index.js';
import { User } from './modules/users/user.model.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  // Reconcile User indexes with the schema — the email uniqueness index became
  // partial when phone login was added, so the old one must be replaced.
  // Cheap for this collection size; failures are non-fatal.
  await User.syncIndexes().catch((err) => {
    console.error('[startup] User.syncIndexes failed:', err);
  });

  startJobs();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    stopJobs();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });

  // An uncaught exception leaves the process in an undefined state — log it and
  // exit so the platform restarts a clean instance (don't keep serving).
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
