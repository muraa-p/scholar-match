import type { Express } from 'express';

// Dev-only Vite middleware for HMR. Kept in its own module so the production
// serverless entry (api/index.ts -> server.ts) never imports Vite.
export async function mountVite(app: Express) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}
