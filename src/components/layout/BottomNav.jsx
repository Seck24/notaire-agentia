import { NavLink } from 'react-router-dom'
import { Home, FilePlus, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/nouvel-acte', icon: FilePlus, label: 'Nouvel Acte' },
  { to: '/parametres', icon: Settings, label: 'Parametres' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #E8DDD0',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -2px 12px rgba(107, 76, 42, 0.08)',
    }}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 4px 8px',
            textDecoration: 'none',
            color: isActive ? '#6B4C2A' : '#9A8A7A',
            position: 'relative',
            borderTop: isActive ? '2px solid #C8A882' : '2px solid transparent',
            transition: 'all 0.15s ease',
          })}
        >
          <Icon size={20} />
          <span style={{
            fontSize: '10px',
            marginTop: '4px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}>
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
