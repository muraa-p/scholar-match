import { Inngest } from 'inngest';
import { runDiscoveryRun } from './discovery';

// Create a single shared Inngest client
export const inngest = new Inngest({
  id: 'scholarmatch',
  // Signing key is loaded from env automatically by the SDK
});

// The scheduled discovery job: fetches all public scholarship feeds
export const discoveryJob = inngest.createFunction(
  {
    id: 'run-scholarship-discovery',
    retries: 2,
    // Run daily at 02:00 UTC
    triggers: [{ cron: '0 2 * * *' }],
  },
  async ({ step }) => {
    return step.run('discover-feeds', () => runDiscoveryRun(''));
  }
);

// A manual endpoint trigger so we can kick off discovery on demand for testing
export const manualDiscoveryRun = inngest.createFunction(
  {
    id: 'manual-scholarship-discovery-run',
    triggers: [{ event: 'scholarmatch/discovery.manual' }],
  },
  async ({ step }) => {
    return step.run('discover-feeds', () => runDiscoveryRun(''));
  }
);
