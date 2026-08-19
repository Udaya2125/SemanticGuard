import React from 'react';
import Icon from './Icon';
import type { TestResponse } from '../lib/api';

interface AgentOutputCardProps {
  result: TestResponse | null;
}

const isErrorOutput = (text: string) => text.trim().toLowerCase().startsWith('error:');

const AgentOutputCard: React.FC<AgentOutputCardProps> = ({ result }) => {
  if (!result) return null;

  const blocked = result.decision.action === 'BLOCK';
  const failed = isErrorOutput(result.agent_output);

  return (
    <div className="card card-pad reveal">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Icon name="brain" size={15} className="text-tertiary" />
          <span className="eyebrow">Agent Output</span>
        </div>
        <span className="badge badge-neutral">{result.mode}</span>
      </div>

      <div
        style={{
          background: 'var(--bg-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          fontSize: 13.5,
          lineHeight: 1.6,
          color: failed ? 'var(--status-block)' : 'var(--text-primary)',
          fontFamily: failed ? 'var(--font-mono)' : 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {result.agent_output}
      </div>

      {blocked && !failed && (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            color: 'var(--status-block)',
          }}
        >
          <Icon name="alert-triangle" size={13} />
          Agent attempted to return protected information.
        </div>
      )}

      {failed && (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12.5,
            color: 'var(--text-tertiary)',
          }}
        >
          <Icon name="wifi-off" size={13} />
          The agent call failed — this decision reflects the pipeline's failure-handling behavior, not a genuine content evaluation.
        </div>
      )}
    </div>
  );
};

export default AgentOutputCard;
