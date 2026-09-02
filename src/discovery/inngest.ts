import { Inngest } from 'inngest';
import { runDiscoveryRun, DISCOVERY_QUERIES } from './discovery';

// Create a single shared Inngest client
export const inngest = new Inngest({
  id: 'scholarmatch',
  // Signing key is loaded from env automatically by the SDK
});

// The scheduled discovery job: runs all configured queries
export const discoveryJob = inngest.createFunction(
  {
    id: 'run-scholarship-discovery',
    retries: 2,
    // Run daily at 02:00 UTC
    triggers: [{ cron: '0 2 * * *' }],
  },
  async ({ step }) => {
    const total = { results: 0, errors: 0 };
    for (const q of DISCOVERY_QUERIES) {
      const res = await step.run(`discover:${q.id}`, () => runDiscoveryRun(q.query));
      total.results += res.results;
      total.errors += res.errors;
    }
    return total;
  }
);

// A manual endpoint trigger so we can kick off discovery on demand for testing
export const manualDiscoveryRun = inngest.createFunction(
  {
    id: 'manual-scholarship-discovery-run',
    triggers: [{ event: 'scholarmatch/discovery.manual' }],
  },
  async ({ event, step }) => {
    const query = event.data?.query as string | undefined;
    if (query) {
      return step.run('discover-custom', () => runDiscoveryRun(query));
    }
    const total = { results: 0, errors: 0 };
    for (const q of DISCOVERY_QUERIES) {
      const res = await step.run(`discover:${q.id}`, () => runDiscoveryRun(q.query));
      total.results += res.results;
      total.errors += res.errors;
    }
    return total;
  }
);
