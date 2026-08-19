import { useEffect, useRef, useState } from 'react';
import { checkHealth } from '../lib/api';

export type HealthState = 'checking' | 'online' | 'offline';

/**
 * Polls the real /health endpoint. This is the only live signal the backend
 * exposes about its own process — there is no dedicated endpoint for Gemini
 * connectivity or index status, so we do not fabricate one. Since the vault
 * index and Gemini clients are constructed at process import time (before
 * FastAPI can serve /health), a successful health check implies those
 * singletons initialized without raising — see Sidebar for how this is
 * labeled honestly.
 */
export function useBackendHealth(intervalMs = 15000): HealthState {
  const [state, setState] = useState<HealthState>('checking');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const run = async () => {
      try {
        const ok = await checkHealth();
        if (mounted.current) setState(ok ? 'online' : 'offline');
      } catch {
        if (mounted.current) setState('offline');
      }
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}
