import React, { useEffect, useState } from 'react';
import Icon, { type IconName } from './Icon';
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
  icon: IconName;
  detail: (result: TestResponse) => string;
}

const STAGES: StageDef[] = [
  {
    key: 'request',
    title: 'User Request',
    icon: 'arrow-down',
    detail: (r) => `"${r.query.length > 40 ? r.query.slice(0, 40) + '…' : r.query}"`,
  },
  {
    key: 'agent',
    title: 'AI Agent',
    icon: 'brain',
    detail: (r) => `${r.mode} mode · output generated`,
  },
  {
    key: 'semantic',
    title: 'Semantic Scorer',
    icon: 'search',
    detail: (r) =>
      r.semantic.matched_document_id
        ? `${toPercent(similarityFromScore(r.semantic.score))} match · ${titleCaseDocId(r.semantic.matched_document_id)}`
        : 'No vault match found',
  },
  {
    key: 'judge',
    title: 'Fact Judge',
    icon: 'scale',
    detail: (r) =>
      r.fact_judge.is_derived
        ? `Factual overlap detected · ${toPercent(r.fact_judge.confidence)} confidence`
        : 'No factual overlap detected',
  },
  {
    key: 'decision',
    title: 'Decision Engine',
    icon: 'gauge',
    detail: (r) => `Final decision: ${r.decision.action}`,
  },
];

/**
 * The backend returns one atomic response — there is no streaming API for
 * intermediate pipeline stages. Once the real result arrives, this reveals
 * each stage's REAL data (agent output, semantic match, fact-judge verdict,
 * decision) in a brief staggered sequence purely for legibility, so a judge
 * can watch the pipeline instead of seeing "input -> BLOCK" instantly. No
 * stage shows data that isn't in the actual API response.
 */
const REVEAL_STEP_MS = 260;

const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ status, result }) => {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (status === 'idle') {
      setRevealed(0);
      return;
    }
    if (status === 'running') {
      setRevealed(1); // request submitted
      return;
    }
    if (status === 'error') {
      setRevealed(1);
      return;
    }
    if (status === 'complete' && result) {
      setRevealed(1);
      const timers: number[] = [];
      for (let i = 2; i <= STAGES.length; i++) {
        timers.push(window.setTimeout(() => setRevealed(i), (i - 1) * REVEAL_STEP_MS));
      }
      return () => timers.forEach((t) => window.clearTimeout(t));
    }
  }, [status, result]);

  return (
    <div className="pipeline">
      {STAGES.map((stage, idx) => {
        const stepNum = idx + 1;
        const isComplete = status === 'complete' && revealed >= stepNum;
        const isRunning =
          (status === 'running' && stepNum === 2) ||
          (status === 'complete' && revealed === stepNum - 1 && stepNum > 1);
        const isError = status === 'error' && stepNum === 2 && revealed < 2;
        const isPending = !isComplete && !isRunning && !isError;

        return (
          <React.Fragment key={stage.key}>
            <div
              className={`pipeline-stage ${isComplete ? 'is-complete' : ''} ${isRunning ? 'is-running' : ''} ${
                isError ? 'is-error' : ''
              } ${isPending ? 'is-pending' : ''}`}
            >
              <div className="pipeline-stage-icon">
                {isComplete ? (
                  <Icon name="check" size={14} strokeWidth={2.2} />
                ) : isRunning ? (
                  <span className="spinner" />
                ) : (
                  <Icon name={stage.icon} size={14} />
                )}
              </div>
              <div className="pipeline-stage-body">
                <div className="pipeline-stage-title">{stage.title}</div>
                <div className="pipeline-stage-detail">
                  {isComplete && result
                    ? stage.detail(result)
                    : isRunning
                    ? 'Processing…'
                    : isError
                    ? 'Request failed'
                    : 'Waiting'}
                </div>
              </div>
            </div>
            {idx < STAGES.length - 1 && (
              <div className={`pipeline-connector ${isComplete ? 'is-active' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PipelineVisualization;
