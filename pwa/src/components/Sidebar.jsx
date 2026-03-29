import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus, MessageSquare, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FilePlus, label: 'Nouvel Acte', path: '/nouvel-acte' },
  { icon: MessageSquare, label: 'Mode Conseil', path: '/conseil' },
  { icon: Settings, label: 'Parametres', path: null },
]

export default function Sidebar() {
  const { cabinet, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="desktop-sidebar" style={{
      width: 220,
      minWidth: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)', fontWeight: 400 }}>
          Preo IA
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
          Notariat
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const active = item.path && location.pathname === item.path
          const disabled = !item.path
          const Icon = item.icon
          return (
            <div
              key={item.label}
              onClick={() => !disabled && navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                cursor: disabled ? 'default' : 'pointer',
                borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                color: active ? 'var(--gold)' : disabled ? 'var(--dim)' : 'var(--muted)',
                fontSize: 13,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!disabled && !active) e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                if (!disabled && !active) e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {item.label}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--text)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cabinet?.nom_cabinet || 'Cabinet'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--gold)',
            background: 'var(--gold-glow)',
            border: '1px solid var(--gold-border)',
            borderRadius: 4,
            padding: '3px 8px',
          }}>
            {cabinet?.plan || 'Starter'}
          </span>
          <LogOut
            size={14}
            strokeWidth={1.5}
            style={{ color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s' }}
            onClick={() => { logout(); navigate('/login') }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          />
        </div>
      </div>
    </div>
  )
}
