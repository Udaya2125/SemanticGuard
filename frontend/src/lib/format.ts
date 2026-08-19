// Presentation-only helpers. These format real API values for display;
// they never alter what the backend decided.

/**
 * The API's `semantic.score` is FAISS's squared L2 distance between the
 * agent output's embedding and the nearest vault document's embedding
 * (both are unit-norm vectors from the local sentence-transformer model,
 * confirmed range ~0–2). This converts that distance into a 0–1 cosine
 * similarity for a human-readable percentage: cos_sim = 1 - score / 2.
 * This is a display transform only — the decision engine's own internal
 * logic is untouched.
 */
export function similarityFromScore(score: number | null | undefined): number | null {
  if (score === null || score === undefined) return null;
  const cos = 1 - score / 2;
  return Math.max(0, Math.min(1, cos));
}

export function toPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export type ConfidenceBucket = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export function confidenceBucket(confidence: number | null | undefined): ConfidenceBucket {
  if (confidence === null || confidence === undefined) return 'UNKNOWN';
  if (confidence >= 0.75) return 'HIGH';
  if (confidence >= 0.5) return 'MEDIUM';
  return 'LOW';
}

export function formatMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function truncate(text: string, max = 64): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function titleCaseDocId(id: string | null | undefined): string {
  if (!id) return 'Unknown';
  return id
    .split('_')
    .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}
