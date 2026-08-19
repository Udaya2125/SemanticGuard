import React, { useEffect, useState } from 'react';
import Icon from './components/Icon';
import { LoadingState, ErrorState, EmptyState } from './components/States';
import { fetchVault, type VaultDocument } from './lib/api';

const VaultPage: React.FC = () => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    fetchVault()
      .then(setDocuments)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load vault'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const uniqueLineageTags = new Set(documents.map((d) => d.lineage_tag)).size;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-kicker">
            <span className="eyebrow" style={{ color: 'var(--accent-strong)' }}>Protected Vault</span>
          </div>
          <h1 className="page-title">Data protected by SemanticGuard</h1>
          <p className="page-subtitle">
            The reference dataset used to detect semantic exfiltration. All records are synthetic and
            created for demonstration purposes only.
          </p>
        </div>
        <span className="badge badge-neutral">
          <Icon name="lock" size={11} />
          Synthetic Data
        </span>
      </div>

      {isLoading && <LoadingState label="Loading protected vault…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!isLoading && !error && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-icon"><Icon name="database" size={16} /></div>
              <div className="stat-card-value">{documents.length}</div>
              <div className="stat-card-label">Protected Documents</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><Icon name="layers" size={16} /></div>
              <div className="stat-card-value">{documents.length}</div>
              <div className="stat-card-label">Records Indexed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><Icon name="brain" size={16} /></div>
              <div className="stat-card-value mono" style={{ fontSize: 15 }}>MiniLM-L6-v2</div>
              <div className="stat-card-label">Embedding Index · FAISS Flat L2</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon"><Icon name="tag" size={16} /></div>
              <div className="stat-card-value">{uniqueLineageTags}</div>
              <div className="stat-card-label">Lineage Tags Tracked</div>
            </div>
          </div>

          {documents.length === 0 ? (
            <EmptyState icon="database" title="No protected documents" description="The vault directory is empty or failed to index." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {documents.map((doc) => (
                <div key={doc.document_id} className="card card-pad">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--accent-soft)',
                          color: 'var(--accent-strong)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="lock" size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.type}</div>
                        <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {doc.document_id}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-block">
                        <Icon name="shield-alert" size={10} />
                        {doc.classification}
                      </span>
                      <span className="badge badge-allow">
                        <Icon name="search" size={10} />
                        Semantic Indexed
                      </span>
                      <span className="badge badge-neutral">
                        <Icon name="tag" size={10} />
                        {doc.lineage_tag}
                      </span>
                    </div>
                  </div>

                  <div className="divider" style={{ margin: '16px 0' }} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px 24px' }}>
                    {Object.entries(doc.content).map(([key, value]) => (
                      <div key={key}>
                        <div className="eyebrow" style={{ marginBottom: 3 }}>{key.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaultPage;
