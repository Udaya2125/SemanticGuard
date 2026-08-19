import React from 'react';
import Icon, { type IconName } from './Icon';
import { useBackendHealth } from '../hooks/useBackendHealth';

export type Page = 'live-test' | 'vault' | 'alerts' | 'audit';

interface NavEntry {
  id: Page;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'live-test', label: 'Live Test', icon: 'terminal' },
  { id: 'vault', label: 'Protected Vault', icon: 'database' },
  { id: 'alerts', label: 'Alerts', icon: 'alert-triangle' },
  { id: 'audit', label: 'Audit Logs', icon: 'file' },
];

interface SidebarProps {
  active: Page;
  onNavigate: (page: Page) => void;
  alertCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, alertCount }) => {
  const health = useBackendHealth();

  // The vault index, Gemini clients, and Fact Judge are all constructed as
  // singletons at backend process import time — before /health can even be
  // served. So a successful health check implies all three initialized
  // without raising. We label these as "Initialized" rather than "Connected"
  // since we don't spend a live Gemini call just to paint a status light.
  const dotClass = health === 'online' ? 'online' : health === 'checking' ? 'checking' : 'offline';
  const statusLabel = health === 'online' ? 'Online' : health === 'checking' ? 'Checking…' : 'Offline';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Icon name="shield-check" size={17} strokeWidth={2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="name">SemanticGuard</span>
          <span className="tag">Semantic Exfiltration Detector</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Console</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
            {item.id === 'alerts' && !!alertCount && (
              <span className="nav-badge">{alertCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-section-label" style={{ padding: '0 12px 2px' }}>
          System Status
        </div>
        <div className="sidebar-status-card">
          <div className="status-row">
            <span className="label">
              <span className={`status-dot ${dotClass}`} />
              API
            </span>
            <span>{statusLabel}</span>
          </div>
          <div className="status-row">
            <span className="label">
              <span className={`status-dot ${dotClass}`} />
              Gemini Client
            </span>
            <span>{health === 'online' ? 'Initialized' : '—'}</span>
          </div>
          <div className="status-row">
            <span className="label">
              <span className={`status-dot ${dotClass}`} />
              Semantic Index
            </span>
            <span>{health === 'online' ? 'Ready' : '—'}</span>
          </div>
          <div className="status-row">
            <span className="label">
              <span className={`status-dot ${dotClass}`} />
              Fact Judge
            </span>
            <span>{health === 'online' ? 'Ready' : '—'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
