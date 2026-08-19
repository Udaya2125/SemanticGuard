import React, { useEffect, useRef, useState } from 'react';

interface ScoreBarProps {
  label: string;
  value: number | null; // 0..1 — the real backend-derived value, final and unmodified
  displayValue: string; // fallback text shown when value is null (e.g. "—")
  tone?: 'accent' | 'allow' | 'block' | 'review';
}

const toneColor: Record<string, string> = {
  accent: 'var(--accent)',
  allow: 'var(--status-allow)',
  block: 'var(--status-block)',
  review: 'var(--status-review)',
};

const COUNT_UP_MS = 560;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A precise instrument reading, not a progress bar: a thin ruler with
 * quarter ticks and a large monospace numeral. Animates the displayed
 * percentage from 0 up to the real backend value on arrival — a cosmetic
 * count-up only. The number this settles on is always exactly `value`;
 * nothing here can drift from or exaggerate the actual score.
 */
const ScoreBar: React.FC<ScoreBarProps> = ({ label, value, displayValue, tone = 'accent' }) => {
  const target = value === null ? 0 : Math.round(value * 1000) / 1000;
  const [animated, setAnimated] = useState(prefersReducedMotion() ? target : 0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (value === null) return;
    if (prefersReducedMotion()) {
      setAnimated(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(from + (target - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setAnimated(target);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, value]);

  const pct = value === null ? 0 : Math.round(animated * 100);
  const color = toneColor[tone];

  return (
    <div>
      <div className="score-meter-head">
        <span className="eyebrow">{label}</span>
        <span className="score-meter-value" style={{ color }}>
          {value === null ? displayValue : `${pct}%`}
        </span>
      </div>
      <div className="score-meter-track">
        <div className="score-meter-fill" style={{ width: `${pct}%`, background: color }} />
        <div className="score-meter-ticks" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
};

export default ScoreBar;
