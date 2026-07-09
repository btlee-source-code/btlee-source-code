/**
 * Wraps async route handlers so thrown errors are forwarded to Express's
 * error-handling middleware automatically. Removes the need for try/catch
 * in every controller.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler(fn: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
