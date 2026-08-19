import React, { useEffect, useRef, useState } from 'react';
import Icon from './components/Icon';
import SecurityDecisionCard from './components/SecurityDecisionCard';
import PipelineVisualization, { PIPELINE_SETTLE_MS, type PipelineStatus } from './components/PipelineVisualization';
import AgentOutputCard from './components/AgentOutputCard';
import DetectionExplanation from './components/DetectionExplanation';
import { runSecurityTest, type TestResponse } from './lib/api';
import { useVaultIndex } from './hooks/useVaultIndex';
import { useBackendHealth } from './hooks/useBackendHealth';

const MODES = ['SAFE', 'LEAKY', 'OBFUSCATED'] as const;

const EXAMPLE_QUERIES = [
  "What was Ananya's latest performance review?",
  'What is the capital of France?',
  "Are there any projects named 'Phoenix'?",
];

const LiveTestPage: React.FC = () => {
  const [mode, setMode] = useState<(typeof MODES)[number]>('SAFE');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<TestResponse | null>(null);
  const [status, setStatus] = useState<PipelineStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { byId: vaultById } = useVaultIndex();
  const { status: health } = useBackendHealth();

  // Monotonic request sequence: a response is only ever applied to UI state
  // if it belongs to the most recently dispatched request. This is
  // defense-in-depth — mode/query are also locked while a request is
  // in flight (below) so a user can't even create two competing intents —
  // but if any future change reintroduces concurrent requests, an older,
  // slower response can never clobber a newer one's result.
  const requestSeqRef = useRef(0);

  const handleRun = async () => {
    if (!query.trim() || status === 'running') return;
    const seq = ++requestSeqRef.current;
    const submittedMode = mode;
    const submittedQuery = query.trim();
    setStatus('running');
    setErrorMessage(null);
    setResult(null);
    try {
      const data = await runSecurityTest(submittedMode, submittedQuery);
      if (requestSeqRef.current !== seq) return; // superseded by a newer request
      setResult(data);
      setStatus('complete');
    } catch (err) {
      if (requestSeqRef.current !== seq) return;
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  // Orchestrated result reveal: the pipeline settles first, then Decision,
  // then Agent Output, then Detection Explanation — real data the whole
  // way, this only paces when each already-known piece appears rather than
  // dumping everything on screen the instant the response lands.
  const [revealStage, setRevealStage] = useState(0);
  useEffect(() => {
    if (status !== 'complete' || !result) {
      setRevealStage(0);
      return;
    }
    const STEP = 170;
    const timers = [1, 2, 3].map((stage) =>
      window.setTimeout(() => setRevealStage(stage), PIPELINE_SETTLE_MS + 100 + (stage - 1) * STEP)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [status, result]);

  // While the response has arrived but hasn't reached its scheduled reveal
  // moment yet, the decision card is still told "running" — an honest
  // pacing of real data, not a fabricated intermediate state.
  const decisionStatus: PipelineStatus = status === 'complete' && revealStage < 1 ? 'running' : status;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="eyebrow" style={{ color: 'var(--accent-strong)' }}>SemanticGuard</span>
          </div>
          <h1 className="page-title">Semantic Data Exfiltration Detector</h1>
          <p className="page-subtitle">
            Runs an AI agent's response through embedding-based semantic retrieval and an
            LLM factual-overlap judge to catch protected data even when it's paraphrased,
            summarized, or reconstructed.
          </p>
        </div>
        <div className="page-engine-status">
          <span className={`status-dot ${health === 'online' ? 'online' : health === 'checking' ? 'checking' : 'offline'}`} />
          Detection Engine {health === 'online' ? 'Online' : health === 'checking' ? 'Checking' : 'Offline'}
        </div>
      </div>

      {/* Request — one workspace, not two cards */}
      <div className={`workspace request-workspace scan-field${status === 'running' ? ' is-active' : ''}`}>
        <div className="request-grid">
          <div className="request-input-col">
            <label className="field-label" htmlFor="query">Query</label>
            <textarea
              id="query"
              className="text-input"
              rows={3}
              placeholder="Ask the agent something…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'running'}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  className="btn btn-ghost btn-sm"
                  style={{ border: '1px solid var(--border-default)', fontWeight: 500 }}
                  onClick={() => setQuery(q)}
                  disabled={status === 'running'}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="request-control-col">
            {/* Locked while a request is in flight — this is the actual fix for the
                "mode says X but result shows Y" confusion: it's now impossible to
                change intent while an earlier request you already fired is still
                resolving, rather than allowing it and hoping the UI explains itself. */}
            <span className="field-label">
              Agent Behavior
              {status === 'running' && <span style={{ color: 'var(--text-disabled)', fontWeight: 500 }}> · locked</span>}
            </span>
            <div className="segmented" style={{ display: 'flex', opacity: status === 'running' ? 0.5 : 1 }}>
              {MODES.map((m) => (
                <button
                  key={m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => setMode(m)}
                  disabled={status === 'running'}
                  style={{ flex: 1 }}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '13px 20px', fontSize: 14, marginTop: 'auto' }}
              onClick={handleRun}
              disabled={status === 'running' || !query.trim()}
            >
              {status === 'running' ? (
                <>
                  <span className="spinner" />
                  Analyzing
                </>
              ) : (
                <>
                  <Icon name="shield-check" size={15} />
                  Run Security Check
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="rule-section">
        <span className="eyebrow" style={{ display: 'block', marginBottom: 18 }}>Detection Pipeline</span>
        <PipelineVisualization status={status} result={result} />
      </div>

      {/* Decision */}
      <SecurityDecisionCard status={decisionStatus} result={result} vaultById={vaultById} />

      {status === 'error' && errorMessage && (
        <div className="rule-section" style={{ borderTopColor: 'var(--status-block-border)' }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{errorMessage}</p>
        </div>
      )}

      {result && revealStage >= 2 && <AgentOutputCard result={result} />}
      {result && revealStage >= 3 && <DetectionExplanation result={result} vaultById={vaultById} />}
    </div>
  );
};

export default LiveTestPage;
