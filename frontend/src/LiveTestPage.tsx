import React, { useState } from 'react';
import Icon from './components/Icon';
import SecurityDecisionCard from './components/SecurityDecisionCard';
import PipelineVisualization, { type PipelineStatus } from './components/PipelineVisualization';
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
  const health = useBackendHealth();

  const handleRun = async () => {
    if (!query.trim() || status === 'running') return;
    setStatus('running');
    setErrorMessage(null);
    setResult(null);
    try {
      const data = await runSecurityTest(mode, query.trim());
      setResult(data);
      setStatus('complete');
    } catch (err) {
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

      <div className="live-test-grid">
        {/* LEFT: Agent Request */}
        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="terminal" size={15} className="text-tertiary" />
            <span className="eyebrow">Agent Request</span>
          </div>

          <div>
            <label className="field-label" htmlFor="query">Question</label>
            <textarea
              id="query"
              className="text-input"
              rows={4}
              placeholder="Ask the agent something…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                className="btn btn-ghost btn-sm"
                style={{ border: '1px solid var(--border-default)', fontWeight: 500 }}
                onClick={() => setQuery(q)}
              >
                {q}
              </button>
            ))}
          </div>

          <div>
            <span className="field-label">Agent Behavior</span>
            <div className="segmented">
              {MODES.map((m) => (
                <button key={m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ padding: '13px 20px', fontSize: 14, marginTop: 4 }}
            onClick={handleRun}
            disabled={status === 'running' || !query.trim()}
          >
            {status === 'running' ? (
              <>
                <span className="spinner" />
                Running…
              </>
            ) : (
              <>
                <Icon name="shield-check" size={15} />
                Run Security Check
              </>
            )}
          </button>
        </div>

        {/* RIGHT: Security Decision */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="shield" size={15} className="text-tertiary" />
            <span className="eyebrow">Security Decision</span>
          </div>
          <SecurityDecisionCard status={status} result={result} vaultById={vaultById} />
        </div>
      </div>

      {/* Pipeline visualization */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <Icon name="activity" size={15} className="text-tertiary" />
          <span className="eyebrow">Detection Pipeline</span>
        </div>
        <div className="card card-pad">
          <PipelineVisualization status={status} result={result} />
        </div>
      </div>

      {(status === 'complete' || status === 'error') && (
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {status === 'error' && errorMessage && (
            <div className="card card-pad" style={{ borderColor: 'var(--status-block-border)', background: 'var(--status-block-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="wifi-off" size={16} style={{ color: 'var(--status-block)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Request failed</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 8 }}>{errorMessage}</p>
            </div>
          )}
          {result && (
            <>
              <AgentOutputCard result={result} />
              <DetectionExplanation result={result} vaultById={vaultById} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTestPage;
