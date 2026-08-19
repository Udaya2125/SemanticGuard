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
          <div className="registry-summary">
            <div className="band">
              <span className="band-label">Protected Documents</span>
              <span className="band-value mono">{documents.length}</span>
            </div>
            <div className="band">
              <span className="band-label">Records Indexed</span>
              <span className="band-value mono">{documents.length}</span>
            </div>
            <div className="band">
              <span className="band-label">Embedding Index</span>
              <span className="band-value mono">MiniLM-L6-v2 · FAISS Flat L2</span>
            </div>
            <div className="band">
              <span className="band-label">Lineage Tags</span>
              <span className="band-value mono">{uniqueLineageTags}</span>
            </div>
          </div>

          {documents.length === 0 ? (
            <EmptyState icon="database" title="No protected documents" description="The vault directory is empty or failed to index." />
          ) : (
            <div>
              {documents.map((doc) => (
                <div key={doc.document_id} className="rule-section registry-entry">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <Icon name="lock" size={13} className="text-tertiary" />
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{doc.type}</span>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{doc.document_id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--status-block)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-block)' }} />
                        {doc.classification}
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{doc.lineage_tag}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px 24px', marginTop: 18 }}>
                    {Object.entries(doc.content).map(([key, value]) => (
                      <div key={key}>
                        <div className="eyebrow" style={{ marginBottom: 4 }}>{key.replace(/_/g, ' ')}</div>
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
