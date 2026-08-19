import React, { useState } from 'react';
import Icon from './components/Icon';
import DecisionBadge from './components/DecisionBadge';
import type { TestResponse } from './lib/api';
import { similarityFromScore, toPercent, truncate, titleCaseDocId, formatTimestamp, maskIp, displayAgentOutput } from './lib/format';

interface ResultDisplayProps {
  result: TestResponse & { error?: string };
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [open, setOpen] = useState(false);

  if (result.error) {
    return (
      <div className="card card-pad" style={{ borderColor: 'var(--status-block-border)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-block)' }}>Error</div>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{result.error}</p>
      </div>
    );
  }

  const similarity = similarityFromScore(result.semantic.score);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '15px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textAlign: 'left',
        }}
      >
        <DecisionBadge action={result.decision.action} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
            {result.query}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {result.mode} · {result.semantic.matched_document_id ? titleCaseDocId(result.semantic.matched_document_id) : 'no match'}
            {similarity !== null && ` · ${toPercent(similarity)} similarity`}
          </div>
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
          {formatTimestamp(result.timestamp)}
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-disabled)' }}>
          {truncate(result.request_id, 8)}
        </span>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={15} className="text-tertiary" />
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Agent Output</div>
              <div
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {displayAgentOutput(result.agent_output)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Similarity</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {similarity === null ? '—' : toPercent(similarity)}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Factual Overlap</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {result.fact_judge.is_derived ? toPercent(result.fact_judge.confidence) : 'None'}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Lineage Tag</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {result.lineage_tag ?? '—'}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Processing</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {result.processing_ms.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Timestamp</div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {formatTimestamp(result.timestamp)}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Source</div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {maskIp(result.requester_ip)}
                </div>
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Decision Reason</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.decision.reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
