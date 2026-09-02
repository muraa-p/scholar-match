import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import aiRouter from './src/server/aiRoutes';
import discoveryRouter from './src/server/discoveryRoutes';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// AI routes (summarize, diagnose-fit, draft-sop, review-essay)
app.use('/api/ai', aiRouter);

// Discovery routes (Inngest serve + manual trigger)
app.use('/api/v1', discoveryRouter);

// Vite middleware & Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarMatch Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
