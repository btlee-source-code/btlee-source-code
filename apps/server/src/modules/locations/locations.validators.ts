import { z } from 'zod';

export const locationSearchQuerySchema = z.object({
  q: z.string().trim().min(3).max(100),
});

export type LocationSearchQuery = z.infer<typeof locationSearchQuerySchema>;
