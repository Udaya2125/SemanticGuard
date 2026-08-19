import React, { useEffect, useState } from 'react';
import Icon from './components/Icon';
import ResultDisplay from './ResultDisplay';
import { LoadingState, ErrorState, EmptyState } from './components/States';
import { fetchAuditLogs, type TestResponse } from './lib/api';

const AlertsPage: React.FC = () => {
  const [logs, setLogs] = useState<TestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    fetchAuditLogs(200, 0)
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load alerts'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const blocked = logs.filter((l) => l.decision.action === 'BLOCK');
  const review = logs.filter((l) => l.decision.action === 'REVIEW');
  const allowed = logs.filter((l) => l.decision.action === 'ALLOW');
  const incidents = [...blocked, ...review];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="eyebrow" style={{ color: 'var(--status-block)' }}>Security Alerts</span>
          </div>
          <h1 className="page-title">Security Alerts</h1>
          <p className="page-subtitle">
            Blocked and flagged detection events from the live audit trail, most recent first.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading alerts…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!isLoading && !error && (
        <>
          <div className="stat-grid">
            <div className="stat-card" style={{ borderColor: 'var(--status-block-border)' }}>
              <div className="stat-card-icon" style={{ background: 'var(--status-block-soft)', color: 'var(--status-block)' }}>
                <Icon name="x-circle" size={16} />
              </div>
              <div className="stat-card-value">{blocked.length}</div>
              <div className="stat-card-label">Blocked</div>
            </div>
            <div className="stat-card" style={{ borderColor: 'var(--status-review-border)' }}>
              <div className="stat-card-icon" style={{ background: 'var(--status-review-soft)', color: 'var(--status-review)' }}>
                <Icon name="shield-alert" size={16} />
              </div>
              <div className="stat-card-value">{review.length}</div>
              <div className="stat-card-label">Review</div>
            </div>
            <div className="stat-card" style={{ borderColor: 'var(--status-allow-border)' }}>
              <div className="stat-card-icon" style={{ background: 'var(--status-allow-soft)', color: 'var(--status-allow)' }}>
                <Icon name="check-circle" size={16} />
              </div>
              <div className="stat-card-value">{allowed.length}</div>
              <div className="stat-card-label">Allowed</div>
            </div>
          </div>

          {incidents.length === 0 ? (
            <EmptyState
              icon="shield-check"
              title="No active alerts"
              description="No blocked or flagged events in the recent audit trail."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {incidents.map((log) => (
                <ResultDisplay key={log.request_id} result={log} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlertsPage;
