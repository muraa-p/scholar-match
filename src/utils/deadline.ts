// Shared deadline helpers

export type DeadlineStatus = 'open' | 'upcoming' | 'closing_soon' | 'closed';

export function parseDeadline(deadline?: string | null): Date | null {
  if (!deadline) return null;
  // Support YYYY-MM-DD only (descriptive deadlines are not parseable)
  const m = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(date.getTime()) ? null : date;
}

// Compute the current status of a deadline relative to now.
export function getDeadlineStatus(deadline?: string | null, now: Date = new Date()): DeadlineStatus {
  const date = parseDeadline(deadline);
  if (!date) return 'open'; // no machine-readable deadline → treat as open
  const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'closed';
  if (diffDays <= 14) return 'closing_soon';
  if (diffDays <= 90) return 'open';
  return 'upcoming';
}

// True if the scholarship should be hidden from discovery (deadline passed).
export function isDeadlinePassed(deadline?: string | null, now: Date = new Date()): boolean {
  return getDeadlineStatus(deadline, now) === 'closed';
}
