import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import aiRouter from './src/server/aiRoutes';
import discoveryRouter from './src/server/discoveryRoutes';

dotenv.config();

const app = express();

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// AI routes (summarize, diagnose-fit, draft-sop, review-essay)
app.use('/api/ai', aiRouter);

// Discovery routes (Inngest serve + manual trigger)
app.use('/api/v1', discoveryRouter);

// Mount the production static build (SPA). Used locally (npm start) and on
// Vercel, where the SPA is served as static output and only /api/* reaches
// this function. Guarded so the lambda never crashes if dist/ isn't present
// (e.g. unmatched /api path when only routing API traffic to the function).
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use('/assets', express.static(path.join(distPath, 'assets')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Vite dev middleware — used by launch.ts in development for HMR.
export async function mountVite() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Default export for Vercel's @vercel/node builder.
export default app;
