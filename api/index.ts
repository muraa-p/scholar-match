import app from '../server';

// Vercel serverless function: routes all API + SPA traffic through Express.
// The SPA itself is served from the static `dist/` build by Vercel, while
// `/api/*` requests are routed here via vercel.json rewrites.
export default app;
