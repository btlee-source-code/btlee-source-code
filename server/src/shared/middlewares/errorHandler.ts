/**
 * Global Error Handler Middleware
 * Catches all errors from controllers/middlewares and returns a consistent
 * JSON response. Distinguishes between operational errors (AppError) and
 * unexpected ones.
 */
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';
import { env } from '../../config/env.js';

interface ErrorResponse {
  status: 'error';
  message: string;
  details?: unknown;
  stack?: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  // Operational errors thrown by our code
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }
  // Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  }
  // Mongoose validation errors
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([key, value]) => [key, value.message])
    );
  }
  // Mongoose duplicate key error
  else if ('code' in err && (err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = 'Duplicate value';
    details = (err as { keyValue?: unknown }).keyValue;
  }
  // Mongoose cast error (invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  const response: ErrorResponse = { status: 'error', message };
  if (details !== undefined) response.details = details;
  if (env.NODE_ENV === 'development') response.stack = err.stack;

  // Log unexpected errors (5xx) for debugging
  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json(response);
}

/**
 * Handles requests to routes that don't exist.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
