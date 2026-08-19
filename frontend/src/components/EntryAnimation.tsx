import React, { useEffect, useState } from 'react';

interface EntryAnimationProps {
  onComplete: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Full sequence lands around 1.5s (brief per the brief's target); reduced
// motion collapses to a near-instant reveal — no scan, no letter reveal,
// just a very short opacity transition before the app appears.
const VISIBLE_MS_FULL = 1180;
const EXIT_MS_FULL = 320;
const VISIBLE_MS_REDUCED = 60;
const EXIT_MS_REDUCED = 140;

/**
 * A one-time boot identity sequence — mounted once at the App root and torn
 * down for good once `onComplete` fires. It never remounts on internal page
 * navigation because it isn't part of the page tree; App.tsx only renders
 * it before the first `booted` flip. A real browser refresh remounts the
 * whole app (and this with it) exactly as a fresh load would.
 */
const EntryAnimation: React.FC<EntryAnimationProps> = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const visibleMs = reduced ? VISIBLE_MS_REDUCED : VISIBLE_MS_FULL;
    const exitMs = reduced ? EXIT_MS_REDUCED : EXIT_MS_FULL;

    const exitTimer = window.setTimeout(() => setExiting(true), visibleMs);
    const doneTimer = window.setTimeout(onComplete, visibleMs + exitMs);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`entry-overlay${exiting ? ' is-exiting' : ''}`} role="presentation" aria-hidden="true">
      <div className="entry-trace" />
      <div className="entry-mark-row">
        <div className="entry-word">SemanticGuard</div>
        <div className="entry-sub">AI Security · Data Leak Prevention</div>
      </div>
    </div>
  );
};

export default EntryAnimation;
