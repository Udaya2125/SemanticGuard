import React, { useEffect, useState } from 'react';
import type { TestResponse } from '../lib/api';
import { similarityFromScore, toPercent, titleCaseDocId } from '../lib/format';

export type PipelineStatus = 'idle' | 'running' | 'complete' | 'error';

interface PipelineVisualizationProps {
  status: PipelineStatus;
  result: TestResponse | null;
}

interface StageDef {
  key: string;
  title: string;
  detail: (result: TestResponse) => string;
}

const STAGES: StageDef[] = [
  {
    key: 'request',
    title: 'Request',
    detail: (r) => `"${r.query.length > 34 ? r.query.slice(0, 34) + '…' : r.query}"`,
  },
  {
    key: 'agent',
    title: 'Agent',
    detail: (r) => `${r.mode} mode`,
  },
  {
    key: 'semantic',
    title: 'Semantic',
    detail: (r) =>
      r.semantic.matched_document_id
        ? `${toPercent(similarityFromScore(r.semantic.score))} · ${titleCaseDocId(r.semantic.matched_document_id)}`
        : 'No vault match',
  },
  {
    key: 'judge',
    title: 'Fact Judge',
    detail: (r) =>
      r.fact_judge.is_derived
        ? `Overlap · ${toPercent(r.fact_judge.confidence)}`
        : 'No overlap',
  },
  {
    key: 'decision',
    title: 'Decision',
    detail: (r) => r.decision.action,
  },
  {
    key: 'audit',
    title: 'Audit',
    detail: (r) => `Logged · ${r.request_id.slice(0, 8)}`,
  },
];

const N = STAGES.length;
const posPct = (i: number) => (i / (N - 1)) * 100;

/**
 * The backend returns one atomic response — there is no streaming API for
 * intermediate pipeline stages. While the request is in flight, a signal
 * loops across the full rule to indicate the engine is working without
 * claiming to know which stage it's on. Once the real result arrives, each
 * stage's REAL data is revealed in a brief staggered sequence — a one-shot
 * signal burst paces each reveal purely for legibility. No stage shows data
 * that isn't in the actual API response.
 */
const REVEAL_STEP_MS = 190;

/** How long the pipeline takes to finish revealing all its stages once a
 * real result arrives — exported so LiveTestPage can sequence the result
 * cards (Decision → Agent Output → Detection Explanation) to appear only
 * after the pipeline has visually settled, per the "pipeline settles, then
 * decision, then evidence" reveal order. */
export const PIPELINE_SETTLE_MS = (STAGES.length - 1) * REVEAL_STEP_MS;

const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ status, result }) => {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      setRevealed(0);
      return;
    }
    if (status === 'running') {
      setRevealed(1);
      return;
    }
    if (status === 'error') {
      setRevealed(1);
      return;
    }
    if (status === 'complete' && result) {
      setRevealed(1);
      const timers: number[] = [];
      for (let i = 2; i <= N; i++) {
        timers.push(window.setTimeout(() => setRevealed(i), (i - 1) * REVEAL_STEP_MS));
      }
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
  }, [status, result]);

  const lastCompleteIndex = status === 'idle' ? -1 : Math.min(revealed, N) - 1;
  const fillPct = lastCompleteIndex >= 0 ? posPct(lastCompleteIndex) : 0;

  return (
    <div className="pipeline">
      <div className="pipeline-rule">
        <div className="pipeline-rule-fill" style={{ width: `${fillPct}%` }} />
        {status === 'running' && (
          <div
            className="pipeline-rule-signal is-traveling"
            style={{ ['--signal-start' as string]: '0%', ['--signal-end' as string]: '100%' }}
          />
        )}
        {status === 'complete' && revealed < N && (
          <div
            key={revealed}
            className="pipeline-rule-signal is-traveling-once"
            style={{
              ['--signal-start' as string]: `${posPct(revealed - 1)}%`,
              ['--signal-end' as string]: `${posPct(revealed)}%`,
            }}
          />
        )}
      </div>

      <div className="pipeline-stages">
        {STAGES.map((stage, idx) => {
          const stepNum = idx + 1;
          // Stage 1 (the request itself) is genuinely settled the moment
          // submission happens — every other stage only counts as complete
          // once the real backend response says so.
          const isComplete =
            (status === 'complete' && revealed >= stepNum) || ((status === 'running' || status === 'error') && stepNum === 1);
          // Only stage 2 is ever shown "running" during an in-flight request —
          // we don't know which later stage the backend is actually on, so we
          // don't claim it.
          const isRunning =
            (status === 'running' && stepNum === 2) ||
            (status === 'complete' && revealed === stepNum - 1 && stepNum > 1);
          const isError = status === 'error' && stepNum === 2;

          return (
            <div
              key={stage.key}
              className={`pipeline-stage ${isComplete ? 'is-complete' : ''} ${isRunning ? 'is-running' : ''} ${
                isError ? 'is-error' : ''
              }`}
            >
              <div className="pipeline-marker" />
              <div className="pipeline-stage-title">{stage.title}</div>
              <div className="pipeline-stage-detail">
                {isComplete && result
                  ? stage.detail(result)
                  : isRunning
                  ? 'Processing…'
                  : isError
                  ? 'Failed'
                  : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineVisualization;
