/**
 * Central Route Aggregator
 * All feature module routes mount onto a single API router at /api.
 */
import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { propertiesRouter } from '../modules/properties/properties.routes.js';
import { carsRouter } from '../modules/cars/cars.routes.js';
import { wishlistRouter } from '../modules/wishlist/wishlist.routes.js';
import { ratingsRouter } from '../modules/ratings/ratings.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { savedSearchesRouter } from '../modules/saved-searches/savedSearches.routes.js';
import { reportsRouter } from '../modules/reports/reports.routes.js';
import { adminAuthRouter } from '../modules/admin-auth/adminAuth.routes.js';
import { adminsRouter } from '../modules/admins/admins.routes.js';
import { uploadsRouter } from '../modules/cloudinary/cloudinary.routes.js';
import { locationsRouter } from '../modules/locations/locations.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public + authenticated user routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/properties', propertiesRouter);
apiRouter.use('/cars', carsRouter);
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/ratings', ratingsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/saved-searches', savedSearchesRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/uploads', uploadsRouter);
apiRouter.use('/locations', locationsRouter);

// Admin routes
apiRouter.use('/admin/auth', adminAuthRouter);
apiRouter.use('/admin', adminsRouter);
