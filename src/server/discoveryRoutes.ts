import { Router, Request, Response } from 'express';
import { serve } from 'inngest/express';
import { inngest, discoveryJob, manualDiscoveryRun } from '../discovery/inngest';
import { runDiscoveryRun, DISCOVERY_QUERIES } from '../discovery/discovery';
import { admin } from '../lib/supabaseAdmin';

const router = Router();

// Serve Inngest ingest + dashboard endpoints
router.use(
  '/inngest',
  serve({
    client: inngest,
    functions: [discoveryJob, manualDiscoveryRun],
  })
);

// Manual discovery trigger (DEV/troubleshooting): POST /api/v1/discovery/run
// Manual discovery trigger (DEV/troubleshooting): POST /api/v1/discovery/run
router.post('/discovery/run', async (req: Request, res: Response) => {
  const query = req.body?.query as string | undefined;
  // Gate behind a simple shared secret to prevent abuse in production
  const token = process.env.DISCOVERY_RUN_TOKEN;
  if (token && req.headers['x-discovery-token'] !== token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const queriesToRun = query ? [{ id: 'custom', query }] : DISCOVERY_QUERIES;
    const results: Record<string, any> = {};
    for (const q of queriesToRun) {
      results[q.id] = await runDiscoveryRun(q.query);
    }
    return res.json({ ok: true, results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: (e as Error).message });
  }
});

export default router;
