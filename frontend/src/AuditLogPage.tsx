import React, { useEffect, useMemo, useState } from 'react';
import Icon from './components/Icon';
import DecisionBadge from './components/DecisionBadge';
import { LoadingState, ErrorState, EmptyState } from './components/States';
import { fetchAuditLogs, type TestResponse } from './lib/api';
import { similarityFromScore, toPercent, titleCaseDocId, truncate } from './lib/format';

type FilterAction = 'ALL' | 'ALLOW' | 'BLOCK' | 'REVIEW';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<TestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterAction>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    fetchAuditLogs(200, 0)
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load audit logs'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== 'ALL' && l.decision.action !== filter) return false;
      if (search.trim() && !l.query.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [logs, search, filter]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="eyebrow" style={{ color: 'var(--accent-strong)' }}>Audit Logs</span>
          </div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">
            Every pipeline decision, logged locally for review and traceability. Ordered most recent first.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading audit logs…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!isLoading && !error && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                className="text-input"
                style={{ paddingLeft: 34 }}
                placeholder="Filter loaded logs by query text…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="segmented">
              {(['ALL', 'ALLOW', 'REVIEW', 'BLOCK'] as FilterAction[]).map((f) => (
                <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
              {filtered.length} of {logs.length} loaded
            </span>
          </div>

          {logs.length === 0 ? (
            <EmptyState icon="file" title="No audit logs yet" description="Run a Live Test to generate the first audit event." />
          ) : filtered.length === 0 ? (
            <EmptyState icon="search" title="No matching logs" description="Try a different search term or filter." />
          ) : (
            <div className="card">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Query</th>
                      <th>Agent Mode</th>
                      <th>Decision</th>
                      <th>Similarity</th>
                      <th>Fact Confidence</th>
                      <th>Matched Document</th>
                      <th>Request ID</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log) => {
                      const similarity = similarityFromScore(log.semantic.score);
                      const isOpen = expandedId === log.request_id;
                      return (
                        <React.Fragment key={log.request_id}>
                          <tr
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedId(isOpen ? null : log.request_id)}
                          >
                            <td className="truncate" style={{ maxWidth: 260, color: 'var(--text-primary)' }}>
                              {log.query}
                            </td>
                            <td>
                              <span className="badge badge-neutral">{log.mode}</span>
                            </td>
                            <td>
                              <DecisionBadge action={log.decision.action} size="sm" />
                            </td>
                            <td>{similarity === null ? '—' : toPercent(similarity)}</td>
                            <td>{log.fact_judge.is_derived ? toPercent(log.fact_judge.confidence) : '—'}</td>
                            <td>{log.semantic.matched_document_id ? titleCaseDocId(log.semantic.matched_document_id) : '—'}</td>
                            <td className="mono" style={{ fontSize: 11.5 }}>{truncate(log.request_id, 8)}</td>
                            <td>
                              <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={14} className="text-tertiary" />
                            </td>
                          </tr>
                          {isOpen && (
                            <tr>
                              <td colSpan={8} style={{ background: 'var(--bg-inset)', padding: '16px 18px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div>
                                    <div className="eyebrow" style={{ marginBottom: 6 }}>Agent Output</div>
                                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                      {log.agent_output}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="eyebrow" style={{ marginBottom: 6 }}>Decision Reason</div>
                                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{log.decision.reason}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogPage;
