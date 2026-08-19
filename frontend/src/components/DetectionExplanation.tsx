import React from 'react';
import type { TestResponse, VaultDocument } from '../lib/api';
import { similarityFromScore, toPercent, titleCaseDocId, formatTimestamp, maskIp, truncate } from '../lib/format';

interface DetectionExplanationProps {
  result: TestResponse | null;
  vaultById: Record<string, VaultDocument>;
}

const Row: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12.5, padding: '6px 0' }}>
    <span className="text-tertiary">{label}</span>
    <span
      className={mono ? 'mono' : undefined}
      style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}
    >
      {children}
    </span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="detection-section">
    <span className="eyebrow">{title}</span>
    <div className="divider" style={{ margin: '10px 0 2px' }} />
    {children}
  </div>
);

const DetectionExplanation: React.FC<DetectionExplanationProps> = ({ result, vaultById }) => {
  if (!result) return null;

  const similarity = similarityFromScore(result.semantic.score);
  const matchedDoc = result.semantic.matched_document_id ? vaultById[result.semantic.matched_document_id] : null;

  return (
    <div className="rule-section">
      <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Detection Explanation</span>
      <div className="workspace detection-panel">
        <Section title="Semantic Evidence">
          <Row label="Matched document">
            {result.semantic.matched_document_id ? titleCaseDocId(result.semantic.matched_document_id) : 'None'}
          </Row>
          <Row label="Document type">{matchedDoc?.type ?? '—'}</Row>
          <Row label="Similarity score">{similarity === null ? '—' : toPercent(similarity)}</Row>
          <Row label="Raw distance (API)" mono>
            {result.semantic.score === null ? '—' : result.semantic.score.toFixed(4)}
          </Row>
        </Section>

        <Section title="Factual Evidence">
          <Row label="Overlap detected">{result.fact_judge.is_derived ? 'Yes' : 'No'}</Row>
          <Row label="Confidence">{result.fact_judge.confidence === null ? '—' : toPercent(result.fact_judge.confidence)}</Row>
          {result.fact_judge.matched_facts.length > 0 ? (
            <ul style={{ margin: '10px 0 0', paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {result.fact_judge.matched_facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>No protected facts matched.</p>
          )}
        </Section>

        <Section title="Decision & Trace">
          <Row label="Action">{result.decision.action}</Row>
          <Row label="Lineage tag" mono>{result.lineage_tag ?? '—'}</Row>
          <Row label="Request ID" mono>{truncate(result.request_id, 20)}</Row>
          <Row label="Timestamp" mono>{formatTimestamp(result.timestamp)}</Row>
          <Row label="Source" mono>{maskIp(result.requester_ip)}</Row>
          <Row label="Processing time" mono>{result.processing_ms.toFixed(0)}ms</Row>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
            {result.decision.reason}
          </p>
        </Section>
      </div>
    </div>
  );
};

export default DetectionExplanation;
