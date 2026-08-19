import React from 'react';
import Icon from './Icon';
import type { TestResponse } from '../lib/api';
import { sanitizeAgentOutput, displayAgentOutput, EMPTY_AGENT_OUTPUT_MESSAGE } from '../lib/format';

interface AgentOutputCardProps {
  result: TestResponse | null;
}

const isErrorOutput = (text: string) => text.trim().toLowerCase().startsWith('error:');

const toneFor = (action: string): 'allow' | 'block' | 'review' =>
  action === 'ALLOW' ? 'allow' : action === 'BLOCK' ? 'block' : 'review';

const AgentOutputCard: React.FC<AgentOutputCardProps> = ({ result }) => {
  if (!result) return null;

  const blocked = result.decision.action === 'BLOCK';
  // Error-detection runs on the raw output — the "Error:" prefix is a
  // pipeline-failure signal, not reasoning content, and sanitization never
  // touches it either way. Only the rendered text is sanitized.
  const failed = isErrorOutput(result.agent_output);
  const displayOutput = failed ? sanitizeAgentOutput(result.agent_output) : displayAgentOutput(result.agent_output);
  const isEmpty = !failed && displayOutput === EMPTY_AGENT_OUTPUT_MESSAGE;
  const tone = toneFor(result.decision.action);

  return (
    <div className="rule-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="eyebrow">Agent Output</span>
        <span className="badge badge-neutral">{result.mode}</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 16,
          opacity: blocked && !failed ? 0.82 : 1,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 2,
            flexShrink: 0,
            background: failed ? 'var(--border-strong)' : `var(--status-${tone})`,
            opacity: failed ? 1 : 0.5,
            borderRadius: 1,
          }}
        />
        <p
          className={failed ? 'mono' : undefined}
          style={{
            fontSize: 14.5,
            lineHeight: 1.65,
            color: failed ? 'var(--status-block)' : isEmpty ? 'var(--text-tertiary)' : 'var(--text-primary)',
            fontStyle: isEmpty ? 'italic' : 'normal',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {displayOutput}
        </p>
      </div>

      {blocked && !failed && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--status-block)',
          }}
        >
          <Icon name="alert-triangle" size={12} />
          Output contained protected information — intercepted before delivery.
        </div>
      )}

      {failed && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          <Icon name="wifi-off" size={12} />
          The agent call failed — this decision reflects the pipeline's failure-handling behavior, not a genuine content evaluation.
        </div>
      )}
    </div>
  );
};

export default AgentOutputCard;
