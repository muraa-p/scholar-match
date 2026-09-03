import dotenv from 'dotenv';
dotenv.config();

import app from './server';
import { mountVite } from './src/lib/viteDev';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    await mountVite(app);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarMatch Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
