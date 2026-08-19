import { useEffect, useState } from 'react';
import { fetchVault, type VaultDocument } from '../lib/api';

/**
 * Fetches the real vault contents once and indexes them by document_id,
 * so other pages can show a friendlier label (e.g. document `type`) next
 * to a `matched_document_id` without re-fetching or inventing data.
 */
export function useVaultIndex() {
  const [byId, setById] = useState<Record<string, VaultDocument>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVault()
      .then((docs) => {
        if (cancelled) return;
        const map: Record<string, VaultDocument> = {};
        docs.forEach((d) => {
          map[d.document_id] = d;
        });
        setById(map);
      })
      .catch(() => {
        // Non-critical enrichment — pages still work with raw document IDs.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { byId, loaded };
}
