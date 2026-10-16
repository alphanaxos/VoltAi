import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar, { NAV_ITEMS } from '../../components/Slider/Sidebar';
import Syste_OverView from '../../components/DashBoard/System_Overview/Syste_OverView';
import Analysis from '../../components/DashBoard/Analysis/Analysis';
import Pypsa from '../../components/DashBoard/PyPSa/Pypsa';
import Monte_carlo from '../../components/DashBoard/Monte_Carlo/Monte_carlo';
import './Dashboard.css';

const MOBILE_QUERY = '(max-width: 900px)';

function DashBoard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const location = useLocation();

  /* Helper to resolve valid active tab from URL path / hash / localStorage */
  const resolveTab = () => {
    // 1. URL path param e.g. /dashboard/montecarlo
    if (tab && NAV_ITEMS.some((item) => item.id.toLowerCase() === tab.toLowerCase())) {
      return NAV_ITEMS.find((item) => item.id.toLowerCase() === tab.toLowerCase()).id;
    }
    // 2. Legacy hash e.g. #montecarlo
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && NAV_ITEMS.some((item) => item.id.toLowerCase() === hash)) {
      return NAV_ITEMS.find((item) => item.id.toLowerCase() === hash).id;
    }
    // 3. Saved tab from localStorage
    try {
      const saved = localStorage.getItem('dash-active-tab');
      if (saved && NAV_ITEMS.some((item) => item.id === saved)) {
        return saved;
      }
    } catch {
      /* storage unavailable, fallback */
    }
    return 'overview';
  };

  const active = resolveTab();

  // Keep URL in sync with path-based routing (/dashboard/:tab) without hash
  useEffect(() => {
    try {
      localStorage.setItem('dash-active-tab', active);
    } catch {
      /* storage unavailable, ignore */
    }

    const currentPath = location.pathname.toLowerCase();
    const expectedPath = `/dashboard/${active}`;

    // If path is /dashboard (without tab), mismatch, or still has a hash in URL
    if (currentPath !== expectedPath || window.location.hash) {
      navigate(expectedPath, { replace: true });
    }
  }, [active, location.pathname, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);

  /* desktop collapsed state, remembered between visits */
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sb-collapsed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sb-collapsed', collapsed ? '1' : '0');
    } catch {
      /* storage unavailable, ignore */
    }
  }, [collapsed]);

  const current = NAV_ITEMS.find((item) => item.id === active) || NAV_ITEMS[0];

  const handleSelect = (id) => {
    try {
      localStorage.setItem('dash-active-tab', id);
    } catch {
      /* storage unavailable, ignore */
    }
    navigate(`/dashboard/${id}`);
    setMenuOpen(false);
  };

  /* desktop: collapse / expand. phone: the same button closes the drawer */
  const handleToggle = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMenuOpen(false);
    } else {
      setCollapsed((c) => !c);
    }
  };

  /* close the mobile drawer with Escape */
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`dashboard ${collapsed ? 'sb-collapsed' : ''}`}>
      <Sidebar
        active={active}
        onSelect={handleSelect}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onToggle={handleToggle}
      />

      <div className="dash-main">
        {/* phone: topbar with hamburger and active tab title */}
        <div className="dash-topbar">
          <button
            type="button"
            className="dash-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="dash-topbar-title">{current.label}</span>
        </div>

        <main className="dash-content">
          {active === 'overview' ? (
            <Syste_OverView />
          ) : active === 'scenario' ? (
            <Analysis />
          ) : active === 'dispatch' ? (
            <Pypsa />
          ) : active === 'montecarlo' ? (
            <Monte_carlo />
          ) : (
            <section className="dash-panel">
              <div className="dash-empty-box">
                <div className="dash-empty-icon">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="4 4" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <h2 className="dash-empty-title">{current.label}</h2>
                <p className="dash-empty-text">This section is currently empty and ready for incoming components.</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashBoard;