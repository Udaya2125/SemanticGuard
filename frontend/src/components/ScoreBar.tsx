import React from 'react';

interface ScoreBarProps {
  label: string;
  value: number | null; // 0..1
  displayValue: string;
  tone?: 'accent' | 'allow' | 'block' | 'review';
}

const toneColor: Record<string, string> = {
  accent: 'var(--accent)',
  allow: 'var(--status-allow)',
  block: 'var(--status-block)',
  review: 'var(--status-review)',
};

const ScoreBar: React.FC<ScoreBarProps> = ({ label, value, displayValue, tone = 'accent' }) => {
  const pct = value === null ? 0 : Math.round(value * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span className="eyebrow">{label}</span>
        <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {displayValue}
        </span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: toneColor[tone] }}
        />
      </div>
    </div>
  );
};

export default ScoreBar;
