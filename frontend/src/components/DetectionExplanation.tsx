import React from 'react';
import Icon, { type IconName } from './Icon';
import type { TestResponse, VaultDocument } from '../lib/api';
import { similarityFromScore, toPercent, titleCaseDocId } from '../lib/format';

interface DetectionExplanationProps {
  result: TestResponse | null;
  vaultById: Record<string, VaultDocument>;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12.5, padding: '7px 0' }}>
    <span className="text-tertiary">{label}</span>
    <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{children}</span>
  </div>
);

const Block: React.FC<{ icon: IconName; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="card card-pad" style={{ flex: 1, minWidth: 260 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--accent-soft)',
          color: 'var(--accent-strong)',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={13} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
    </div>
    <div className="divider" style={{ margin: '10px 0 2px' }} />
    {children}
  </div>
);

const DetectionExplanation: React.FC<DetectionExplanationProps> = ({ result, vaultById }) => {
  if (!result) return null;

  const similarity = similarityFromScore(result.semantic.score);
  const matchedDoc = result.semantic.matched_document_id ? vaultById[result.semantic.matched_document_id] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <Icon name="eye" size={16} className="text-tertiary" />
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Detection Explanation</h3>
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Block icon="search" title="Semantic Match">
          <Row label="Matched document">
            {result.semantic.matched_document_id ? titleCaseDocId(result.semantic.matched_document_id) : 'None'}
          </Row>
          <Row label="Document type">{matchedDoc?.type ?? '—'}</Row>
          <Row label="Similarity score">{similarity === null ? '—' : toPercent(similarity)}</Row>
          <Row label="Raw distance (API)">
            {result.semantic.score === null ? '—' : result.semantic.score.toFixed(4)}
          </Row>
        </Block>

        <Block icon="scale" title="Factual Match">
          <Row label="Overlap detected">{result.fact_judge.is_derived ? 'Yes' : 'No'}</Row>
          <Row label="Confidence">{result.fact_judge.confidence === null ? '—' : toPercent(result.fact_judge.confidence)}</Row>
          <Row label="Facts identified">{result.fact_judge.matched_facts.length}</Row>
          {result.fact_judge.matched_facts.length > 0 && (
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {result.fact_judge.matched_facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </Block>

        <Block icon="gavel" title="Final Decision">
          <Row label="Action">{result.decision.action}</Row>
          <Row label="Lineage tag">{result.lineage_tag ?? '—'}</Row>
          <Row label="Processing time">{result.processing_ms.toFixed(0)}ms</Row>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            {result.decision.reason}
          </p>
        </Block>
      </div>
    </div>
  );
};

export default DetectionExplanation;
