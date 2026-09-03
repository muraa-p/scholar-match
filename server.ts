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

// Mount the production static build (SPA). Used both locally (npm start) and
// on Vercel, where the app is imported as a module rather than executed.
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
