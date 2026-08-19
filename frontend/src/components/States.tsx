import React from 'react';
import Icon, { type IconName } from './Icon';

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div
    className="card card-pad fade-in"
    style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}
  >
    <span className="spinner" />
    <span style={{ fontSize: 13.5 }}>{label}</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div
    className="card card-pad fade-in"
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      borderColor: 'var(--status-block-border)',
      background: 'var(--status-block-soft)',
    }}
  >
    <span style={{ color: 'var(--status-block)', flexShrink: 0, marginTop: 1 }}>
      <Icon name="wifi-off" size={18} />
    </span>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 3 }}>
        Backend unavailable
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{message}</div>
    </div>
    {onRetry && (
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>
        <Icon name="refresh" size={13} />
        Retry
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ icon: IconName; title: string; description?: string }> = ({
  icon,
  title,
  description,
}) => (
  <div
    className="card fade-in"
    style={{
      padding: '52px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 12,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-tertiary)',
      }}
    >
      <Icon name={icon} size={20} />
    </div>
    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
    {description && (
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', maxWidth: 360 }}>{description}</div>
    )}
  </div>
);
