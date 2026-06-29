/**
 * Users Validation Schemas
 */
import { z } from 'zod';
import { USER_GOALS } from '../../config/constants.js';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatar: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/)
    .regex(/[0-9]/),
});

export const onboardingSchema = z.object({
  goal: z.enum(USER_GOALS),
});

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
});
