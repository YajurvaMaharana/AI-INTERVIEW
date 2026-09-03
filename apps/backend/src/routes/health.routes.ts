// ---------------------------------------------------------------------------
// health.routes.ts — GET /api/health
// ---------------------------------------------------------------------------

import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../services/db.service';

const router: Router = Router();

/**
 * GET /api/health
 *
 * Returns 200 if the database is reachable, 503 otherwise.
 */
router.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const health = await checkDatabaseConnection();

    if (health.ok) {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          latencyMs: health.latencyMs,
        },
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          latencyMs: health.latencyMs,
          error: health.error,
        },
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: message,
      },
    });
  }
});

export default router;
