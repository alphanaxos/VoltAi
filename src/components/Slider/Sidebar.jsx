import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import voltaiLogo from '../../assets/voltai-logo.png';

/* Helper for consistent icon style */
function Icon({ children }) {
  return (
    <svg
      className="sb-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'System Overview',
    description: 'Live status of the grid, assets and operator alerts.',
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </Icon>
    ),
  },
  {
    id: 'scenario',
    label: 'Scenario Analysis',
    description: 'Compare what-if cases side by side.',
    icon: (
      <Icon>
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="m2 12 10 5 10-5" />
        <path d="m2 17 10 5 10-5" />
      </Icon>
    ),
  },
  {
    id: 'dispatch',
    label: 'PyPSA Economic Dispatch',
    description: 'Least-cost generation schedule from the PyPSA model.',
    icon: (
      <Icon>
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </Icon>
    ),
  },
  {
    id: 'montecarlo',
    label: 'Monte Carlo Risk Analysis',
    description: 'Distribution of outcomes across thousands of simulated runs.',
    icon: (
      <Icon>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </Icon>
    ),
  },
  {
    id: 'demo',
    label: 'Demo Data Controls',
    description: 'Adjust the sample data that drives every view.',
    icon: (
      <Icon>
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
        <path d="M1 14h6M9 8h6M17 16h6" />
      </Icon>
    ),
  },
];

function Sidebar({ active, onSelect, isOpen, onClose, collapsed, onToggle }) {
  const toggleLabel = collapsed ? 'Open sidebar' : 'Close sidebar';

  return (
    <>
      <div
        className={`sb-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        aria-label="Dashboard navigation"
      >
        <div className="sb-head">
          <Link to="/" className="sb-brand" title="Back to Website">
            <img src={voltaiLogo} alt="VoltAI" className="sb-logo" />
            <div className="sb-brand-text">
              <div className="sb-brand-name">VoltAI</div>
              <div className="sb-brand-sub">Operations desk</div>
            </div>
          </Link>

          <button
            type="button"
            className="sb-toggle"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            data-tooltip={toggleLabel}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="3.5" />
              <path d="M8 9.5v5" />
            </svg>
          </button>
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sb-item ${active === item.id ? 'active' : ''}`}
              aria-current={active === item.id ? 'page' : undefined}
              aria-label={item.label}
              data-tooltip={item.label}
              onClick={() => onSelect(item.id)}
            >
              {item.icon}
              <span className="sb-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;