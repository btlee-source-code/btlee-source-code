/**
 * Auth Request Validation Schemas (Zod)
 */
import { z } from 'zod';

// A login/register identifier is either an email or an Egyptian mobile number.
const EGYPT_PHONE = /^01[0125][0-9]{8}$/;

/** Strip spaces/dashes from a phone identifier so "010 1234 5678" matches. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '');
}

/** Treat anything containing "@" as an email; otherwise it's a phone number. */
export function isEmailIdentifier(value: string): boolean {
  return value.includes('@');
}

// Login accepts a single identifier (email OR phone). Registration, however,
// requires BOTH an email and a phone number (Facebook-style sign-up).
const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Email or phone number is required')
  .refine(
    (v) =>
      isEmailIdentifier(v)
        ? z.string().email().safeParse(v).success
        : EGYPT_PHONE.test(normalizePhone(v)),
    'Enter a valid email or Egyptian phone number (e.g. 01012345678)'
  );

const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email');
const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine(
    (v) => EGYPT_PHONE.test(normalizePhone(v)),
    'Enter a valid Egyptian phone number (e.g. 01012345678)'
  );

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: emailSchema,
  phone: phoneSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/)
    .regex(/[0-9]/),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
