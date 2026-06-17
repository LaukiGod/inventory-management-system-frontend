import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Confirm } from './ui'

const ICONS: Record<string, JSX.Element> = {
  dashboard: <path d="M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z" />,
  items: <path d="M21 8L12 3 3 8m18 0l-9 5m9-5v10l-9 5m0-10L3 8m9 5v10M3 8v10l9 5" />,
  today: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  records: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></>,
  staff: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 19c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" /><path d="M16.5 4.5a3.2 3.2 0 0 1 0 6.4M19 19c0-2.6-1.8-4.8-4.2-5.6" /></>,
  categories: <><path d="M20.6 12.4 12 21 3 12V3h9l8.6 9.4Z" /><circle cx="7.5" cy="7.5" r="1.3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}

const STAFF_NAV = [
  { to: '/items', label: 'Stock', icon: 'items' },
  { to: '/today', label: "Today", icon: 'today' },
]

const ADMIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/items', label: 'Stock items', icon: 'items' },
  { to: '/records', label: 'Records', icon: 'records' },
  { to: '/staff', label: 'Staff', icon: 'staff' },
  { to: '/categories', label: 'Categories', icon: 'categories' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = isAdmin ? ADMIN_NAV : STAFF_NAV

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: 'var(--slate-900)', alignItems: 'center', padding: '0 16px',
        justifyContent: 'space-between', zIndex: 50,
      }}>
        <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', padding: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Inventory</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{
        width: 'var(--sidebar-w)', background: 'var(--slate-900)', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 8L12 3 3 8m18 0l-9 5m9-5v10l-9 5m0-10L3 8m9 5v10M3 8v10l9 5" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>Inventory</span>
        </div>

        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
                borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                transition: 'background .12s, color .12s',
              })}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{isAdmin ? 'Admin' : 'Staff'}</div>
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 13.5, fontWeight: 500 }}
          >
            <Icon name="logout" />
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 39 }} className="mobile-overlay" />
      )}

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: '28px 28px 40px' }} className="main-content">
        <Outlet />
      </main>

      <Confirm
        open={confirmLogout}
        title="Log out?"
        message="You'll need to enter your email and password again to sign back in."
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        danger
      />

      <style>{`
        @media (max-width: 860px) {
          .mobile-topbar { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .sidebar {
            position: fixed !important; left: 0; top: 0; height: 100vh;
            transform: translateX(-100%); transition: transform .2s ease; z-index: 40;
          }
          .sidebar.open { transform: translateX(0); }
          .main-content { padding: 72px 16px 32px !important; }
        }
      `}</style>
    </div>
  )
}
