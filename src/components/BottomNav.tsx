import { useNavigate } from 'react-router-dom'

type NavItem = 'fortune' | 'journal' | 'signals' | 'profile'

interface Props {
  active: NavItem
}

export default function BottomNav({ active }: Props) {
  const navigate = useNavigate()

  const items: { id: NavItem; label: string; path: string; icon: React.ReactNode }[] = [
    {
      id: 'fortune',
      label: 'FORTUNE',
      path: '/',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 2V4M11 18V20M2 11H4M18 11H20M4.93 4.93L6.34 6.34M15.66 15.66L17.07 17.07M4.93 17.07L6.34 15.66M15.66 6.34L17.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'journal',
      label: 'JOURNAL',
      path: '/journal',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="4" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 8H14M8 12H14M8 16H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'signals',
      label: 'SIGNALS',
      path: '/signals',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L11.9 9.1L19 11L11.9 12.9L11 20L10.1 12.9L3 11L10.1 9.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'PROFILE',
      path: '/profile',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 19C4 15.686 7.134 13 11 13C14.866 13 18 15.686 18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'nav-active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: rgba(7, 5, 15, 0.95);
          border-top: 1px solid rgba(212, 168, 83, 0.15);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 8px;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 16px;
          color: rgba(155, 143, 168, 0.5);
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-active {
          color: #d4a853;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 8px;
          letter-spacing: 0.15em;
          font-family: Georgia, serif;
        }
      `}</style>
    </nav>
  )
}
