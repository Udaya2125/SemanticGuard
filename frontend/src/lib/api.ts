// Centralized API access. Same backend, same endpoints/contracts as before —
// this only consolidates the previously-duplicated fetch calls.

export const API_BASE = 'http://localhost:8000';

export interface SemanticDetails {
  score: number | null;
  matched_document_id: string | null;
}

export interface FactJudgeDetails {
  is_derived: boolean;
  confidence: number | null;
  matched_facts: string[];
  reason: string | null;
}

export interface DecisionDetails {
  action: 'ALLOW' | 'BLOCK' | 'REVIEW' | string;
  reason: string | null;
}

export interface TestResponse {
  request_id: string;
  mode: string;
  query: string;
  agent_output: string;
  semantic: SemanticDetails;
  fact_judge: FactJudgeDetails;
  decision: DecisionDetails;
  lineage_tag: string | null;
  processing_ms: number;
}

export interface VaultDocument {
  document_id: string;
  type: string;
  classification: string;
  lineage_tag: string;
  content: Record<string, unknown>;
}

export async function runSecurityTest(mode: string, query: string): Promise<TestResponse> {
  const res = await fetch(`${API_BASE}/api/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, query }),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchVault(): Promise<VaultDocument[]> {
  const res = await fetch(`${API_BASE}/api/vault`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchAuditLogs(limit = 100, offset = 0): Promise<TestResponse[]> {
  const res = await fetch(`${API_BASE}/api/audit?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) return false;
  const data = await res.json();
  return data?.status === 'ok';
}
