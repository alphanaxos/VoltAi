import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import voltaiLogo from '../../assets/voltai-logo.png';

const NAV_ITEMS = [
  { label: 'Working', id: 'working' },
  { label: 'Features', id: 'features' },
  { label: 'Operations', id: 'operations' },
  { label: 'FAQ', id: 'faq' },
];

function Header() {
  const [activeSection, setActiveSection] = useState('grid-intelligence');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      setActiveSection('grid-intelligence');
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `/${targetId}`);
      setActiveSection(targetId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header>
        <a href="/" className="logo" onClick={(e) => scrollToSection(e, 'top')}>
          <div className="logo-mark">
            <img src={voltaiLogo} alt="VoltAI" className="voltai-logo" />
          </div>
          <span className="logo-text">VoltAI</span>
        </a>

        <nav>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/${item.id}`}
              className={activeSection === item.id ? 'active' : ''}
              onClick={(e) => scrollToSection(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-cta">
          <Link to="/documentation" className="btn-ghost">
            Documentation
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Dashboard
          </Link>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`/${item.id}`}
              className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={(e) => scrollToSection(e, item.id)}
            >
              <span>{item.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
          <Link
            to="/dashboard"
            className="mobile-nav-link"
            style={{
              marginTop: '6px',
              background: '#1F8A70',
              color: '#FFFFFF',
              justifyContent: 'center',
              fontWeight: 600,
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Open Dashboard</span>
          </Link>
        </div>
      )}
    </>
  );
}

export default Header;