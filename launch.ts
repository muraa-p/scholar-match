import dotenv from 'dotenv';
dotenv.config();

import app, { mountVite } from './server';

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    await mountVite();
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarMatch Server running on http://0.0.0.0:${PORT}`);
  });
}

main();
