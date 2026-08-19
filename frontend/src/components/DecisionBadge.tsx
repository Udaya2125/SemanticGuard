import React from 'react';

interface DecisionBadgeProps {
  action: string;
  size?: 'sm' | 'md';
}

const config: Record<string, { className: string; label: string }> = {
  ALLOW: { className: 'badge-allow', label: 'Allow' },
  BLOCK: { className: 'badge-block', label: 'Block' },
  REVIEW: { className: 'badge-review', label: 'Review' },
};

const DecisionBadge: React.FC<DecisionBadgeProps> = ({ action, size = 'md' }) => {
  const c = config[action] ?? { className: 'badge-neutral', label: action || 'Unknown' };
  return (
    <span
      className={`badge ${c.className}`}
      style={size === 'sm' ? { fontSize: 10.5, padding: '3px 8px' } : undefined}
    >
      <span className="badge-dot" />
      {c.label}
    </span>
  );
};

export default DecisionBadge;
