import type { Request, Response } from 'express';

import { ok } from '../../shared/utils/apiResponse.js';
import type { LocationSearchQuery } from './locations.validators.js';
import * as service from './locations.service.js';

export async function search(req: Request, res: Response): Promise<void> {
  const { q } = req.query as LocationSearchQuery;
  const results = await service.searchLocations(q);
  res.json(ok(results));
}
