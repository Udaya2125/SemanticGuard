import { useEffect, useRef, useState } from 'react';
import { fetchHealth } from '../lib/api';

export type HealthState = 'checking' | 'online' | 'offline';

export interface BackendHealth {
  status: HealthState;
  /** Real value from /health's llm_provider field — never hardcode a vendor name. */
  provider: string | null;
}

/**
 * Polls the real /health endpoint. This is the only live signal the backend
 * exposes about its own process — there is no dedicated endpoint for the
 * active LLM provider's own connectivity or index status, so we do not
 * fabricate one. Since the vault index and the configured LLM provider's
 * client are constructed as singletons at backend process import time
 * (before FastAPI can serve /health), a successful health check implies
 * those singletons initialized without raising — see Sidebar for how this
 * is labeled honestly. The provider name itself is real, sourced from the
 * backend's own settings.LLM_PROVIDER.
 */
export function useBackendHealth(intervalMs = 15000): BackendHealth {
  const [state, setState] = useState<BackendHealth>({ status: 'checking', provider: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const run = async () => {
      try {
        const health = await fetchHealth();
        if (!mounted.current) return;
        if (health?.status === 'ok') {
          setState({ status: 'online', provider: health.llm_provider ?? null });
        } else {
          setState({ status: 'offline', provider: null });
        }
      } catch {
        if (mounted.current) setState({ status: 'offline', provider: null });
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
