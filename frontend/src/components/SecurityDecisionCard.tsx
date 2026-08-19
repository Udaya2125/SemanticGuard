import React from 'react';
import Icon from './Icon';
import DecisionBadge from './DecisionBadge';
import ScoreBar from './ScoreBar';
import type { TestResponse, VaultDocument } from '../lib/api';
import { similarityFromScore, toPercent, confidenceBucket, titleCaseDocId } from '../lib/format';

interface SecurityDecisionCardProps {
  status: 'idle' | 'running' | 'complete' | 'error';
  result: TestResponse | null;
  vaultById: Record<string, VaultDocument>;
}

const HEADLINE: Record<string, { title: string; sub: string }> = {
  ALLOW: { title: 'Allowed', sub: 'Analysis complete. No policy violation detected.' },
  BLOCK: { title: 'Blocked', sub: 'Unauthorized disclosure detected.' },
  REVIEW: { title: 'Review', sub: 'Suspicious signal — below the automatic-block threshold.' },
};

const toneFor = (action: string): 'allow' | 'block' | 'review' =>
  action === 'ALLOW' ? 'allow' : action === 'BLOCK' ? 'block' : 'review';

const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: 168,
      textAlign: 'center',
      color: 'var(--text-tertiary)',
    }}
  >
    {children}
  </div>
);

const SecurityDecisionCard: React.FC<SecurityDecisionCardProps> = ({ status, result, vaultById }) => {
  if (status === 'idle') {
    return (
      <div className="rule-section">
        <Placeholder>
          <Icon name="shield" size={18} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Awaiting request</span>
        </Placeholder>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="rule-section">
        <Placeholder>
          <span className="spinner" style={{ width: 18, height: 18, color: 'var(--accent-strong)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Analyzing</span>
        </Placeholder>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rule-section" style={{ borderTopColor: 'var(--status-block-border)' }}>
        <Placeholder>
          <Icon name="wifi-off" size={18} style={{ color: 'var(--status-block)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Request failed</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', maxWidth: 280 }}>
            Could not reach the SemanticGuard API at localhost:8000.
          </span>
        </Placeholder>
      </div>
    );
  }

  if (!result) return null;

  const action = result.decision.action;
  const headline = HEADLINE[action] ?? { title: action, sub: '' };
  const tone = toneFor(action);
  const similarity = similarityFromScore(result.semantic.score);
  const factualOverlap = result.fact_judge.is_derived ? result.fact_judge.confidence : 0;
  const bucket = confidenceBucket(result.fact_judge.confidence);

  const matchedDoc = result.semantic.matched_document_id ? vaultById[result.semantic.matched_document_id] : null;
  const matchedDocName = matchedDoc?.content?.name;
  const matchedLabel = matchedDoc
    ? `${matchedDoc.type}${typeof matchedDocName === 'string' ? ` / ${matchedDocName}` : ''}`
    : result.semantic.matched_document_id
    ? titleCaseDocId(result.semantic.matched_document_id)
    : 'No match';

  return (
    <div
      key={result.request_id}
      className="rule-section decision-settle"
      style={{
        borderTopColor: `var(--status-${tone}-border)`,
        borderTopWidth: 2,
        ['--settle-color' as string]: `var(--status-${tone}-border)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: `var(--status-${tone})`,
          }}
        >
          {headline.title.toUpperCase()}
        </span>
        <DecisionBadge action={action} size="sm" />
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 8 }}>{headline.sub}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 26 }}>
        <ScoreBar
          label="Semantic Similarity"
          value={similarity}
          displayValue={similarity === null ? '—' : toPercent(similarity)}
          tone={tone}
        />
        <ScoreBar
          label="Factual Overlap"
          value={factualOverlap}
          displayValue={factualOverlap === null ? '—' : toPercent(factualOverlap)}
          tone={tone}
        />
      </div>

      <div className="band" style={{ marginTop: 22 }}>
        <span className="band-label">Confidence</span>
        <span className="band-value mono" style={{ fontWeight: 600 }}>{bucket}</span>
      </div>
      <div className="band">
        <span className="band-label">Matched Data</span>
        <span className="band-value truncate">{matchedLabel}</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 18 }}>
        {result.decision.reason}
      </p>
    </div>
  );
};

export default SecurityDecisionCard;
