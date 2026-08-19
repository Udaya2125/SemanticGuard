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

const HEADLINE: Record<string, { title: string; sub: string; icon: 'check-circle' | 'x-circle' | 'shield-alert' }> = {
  ALLOW: { title: 'Allowed', sub: 'No protected information detected in the agent output.', icon: 'check-circle' },
  BLOCK: { title: 'Blocked', sub: 'Protected information detected.', icon: 'x-circle' },
  REVIEW: { title: 'Review required', sub: 'Suspicious signal — does not meet the automatic-block threshold.', icon: 'shield-alert' },
};

const toneFor = (action: string): 'allow' | 'block' | 'review' =>
  action === 'ALLOW' ? 'allow' : action === 'BLOCK' ? 'block' : 'review';

const SecurityDecisionCard: React.FC<SecurityDecisionCardProps> = ({ status, result, vaultById }) => {
  if (status === 'idle') {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 280, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-default)', color: 'var(--text-tertiary)' }}>
          <Icon name="shield" size={20} />
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>Awaiting security check</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', maxWidth: 280 }}>
          Submit an agent request on the left to run it through the detection pipeline.
        </div>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 280, textAlign: 'center' }}>
        <span className="spinner" style={{ width: 22, height: 22, color: 'var(--accent-strong)' }} />
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Running detection pipeline…</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Agent → Semantic Scorer → Fact Judge → Decision Engine</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="card card-pad" style={{ borderColor: 'var(--status-block-border)', background: 'var(--status-block-soft)', minHeight: 280, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <Icon name="wifi-off" size={22} className="text-secondary" />
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Request failed</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 280 }}>
          Could not reach the SemanticGuard API. Confirm the backend is running at localhost:8000.
        </div>
      </div>
    );
  }

  if (!result) return null;

  const action = result.decision.action;
  const headline = HEADLINE[action] ?? { title: action, sub: '', icon: 'shield-alert' as const };
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
      className={`card card-pad reveal`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: tone === 'block' ? 'var(--glow-block)' : tone === 'allow' ? 'var(--glow-allow)' : undefined,
        borderColor:
          tone === 'block' ? 'var(--status-block-border)' : tone === 'allow' ? 'var(--status-allow-border)' : 'var(--status-review-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: `var(--status-${tone}-soft)`,
            border: `1px solid var(--status-${tone}-border)`,
            color: `var(--status-${tone})`,
          }}
        >
          <Icon name={headline.icon} size={21} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              {headline.title.toUpperCase()}
            </span>
            <DecisionBadge action={action} size="sm" />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{headline.sub}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Confidence</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{bucket}</div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Matched Protected Data</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
            {matchedLabel}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Reason</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{result.decision.reason}</p>
      </div>
    </div>
  );
};

export default SecurityDecisionCard;
