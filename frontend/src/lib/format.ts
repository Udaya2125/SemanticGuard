// Presentation-only helpers. These format real API values for display;
// they never alter what the backend decided.

/**
 * Defense-in-depth display sanitization for agent_output. The backend's
 * Groq provider already strips <think>...</think> reasoning traces before
 * returning a response (see backend/app/agent/groq.py) — this exists in
 * case a provider/model returns such a wrapper unpredictably despite that,
 * so raw chain-of-thought never reaches the UI regardless of which layer
 * catches it. Deliberately narrow: it only matches the specific literal
 * tag names reasoning-wrapper models actually use (<think>, <thinking>),
 * case-insensitively, closed or truncated mid-block. It does not touch
 * generic angle-bracket text, code, or math notation — anything that isn't
 * exactly one of these tag names passes through untouched. Centralized
 * here so every place that renders agent_output sanitizes identically.
 */
const THINK_TAGS = ['think', 'thinking'];
const CLOSED_THINK_RE = new RegExp(`<(${THINK_TAGS.join('|')})>[\\s\\S]*?<\\/\\1>`, 'gi');
const UNCLOSED_THINK_RE = new RegExp(`<(${THINK_TAGS.join('|')})>[\\s\\S]*`, 'gi');

export function sanitizeAgentOutput(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(CLOSED_THINK_RE, '').replace(UNCLOSED_THINK_RE, '').trim();
}

/**
 * A real response can legitimately sanitize down to nothing — e.g. the model
 * spent its entire budget on an unclosed reasoning block and never reached
 * an answer. That's correct stripping, not a bug, but a blank paragraph
 * reads as broken. Every render site shows this explicit fallback instead.
 */
export const EMPTY_AGENT_OUTPUT_MESSAGE = 'No response text was generated.';

export function displayAgentOutput(text: string | null | undefined): string {
  const sanitized = sanitizeAgentOutput(text);
  return sanitized === '' ? EMPTY_AGENT_OUTPUT_MESSAGE : sanitized;
}

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

/**
 * The backend emits two real timestamp shapes depending on when a record
 * was created: new records use full ISO-8601 with a UTC offset
 * ("2026-08-19T19:06:56.700396+00:00"); records backfilled from the
 * pre-existing SQLite `timestamp` column (created before this field existed
 * on TestResponse) use SQLite's own CURRENT_TIMESTAMP format
 * ("2026-08-19 15:20:22", UTC, no offset marker). Both are genuine backend
 * values — this only normalizes parsing/display, never invents a value.
 */
export function formatTimestamp(ts: string | null | undefined): string {
  if (!ts) return 'N/A';
  const normalized = ts.includes('T') ? ts : `${ts.replace(' ', 'T')}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return 'N/A';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Partially redacts an IP address for display while the full value stays
 * available in the backend audit record. IPv4: mask the last two octets
 * ("56.228.xxx.xxx"). IPv6 and anything unrecognized: mask everything past
 * the first segment. Never fabricates an address — returns 'N/A' if absent.
 */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return 'N/A';
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (v4) return `${v4[1]}.${v4[2]}.xxx.xxx`;
  if (ip.includes(':')) {
    const segments = ip.split(':');
    return `${segments[0]}:xxxx:xxxx:xxxx`;
  }
  return ip;
}
