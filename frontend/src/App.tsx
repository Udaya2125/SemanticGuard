import { useEffect, useState } from 'react';
import './App.css';
import Sidebar, { type Page } from './components/Sidebar';
import EntryAnimation from './components/EntryAnimation';
import LiveTestPage from './LiveTestPage';
import VaultPage from './VaultPage';
import AuditLogPage from './AuditLogPage';
import AlertsPage from './AlertsPage';
import { fetchAuditLogs } from './lib/api';

function App() {
  const [activePage, setActivePage] = useState<Page>('live-test');
  const [alertCount, setAlertCount] = useState<number | undefined>(undefined);
  // Boot sequence state lives here, at the App root, so it mounts exactly
  // once per real page load/refresh and never remounts on internal
  // navigation (page switches are just activePage changes — App itself
  // never unmounts). `booted` starts false on every fresh mount, which is
  // also what a browser refresh produces, so refresh naturally replays it.
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAuditLogs(200, 0)
      .then((logs) => {
        if (cancelled) return;
        const count = logs.filter((l) => l.decision.action === 'BLOCK' || l.decision.action === 'REVIEW').length;
        setAlertCount(count);
      })
      .catch(() => {
        // Non-critical — sidebar badge simply stays hidden if audit is unreachable.
      });
    return () => {
      cancelled = true;
    };
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case 'live-test':
        return <LiveTestPage />;
      case 'vault':
        return <VaultPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'audit':
        return <AuditLogPage />;
      default:
        return <LiveTestPage />;
    }
  };

  return (
    <>
      {!booted && <EntryAnimation onComplete={() => setBooted(true)} />}
      <div className="shell">
        <Sidebar active={activePage} onNavigate={setActivePage} alertCount={alertCount} />
        <main className="main reveal stagger-2">
          <div className="main-inner">{renderPage()}</div>
        </main>
      </div>
    </>
  );
}

export default App;
