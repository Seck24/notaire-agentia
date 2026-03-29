import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FilePlus, MessageSquare, Settings } from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
  { icon: FilePlus, label: 'Nouvel Acte', path: '/nouvel-acte' },
  { icon: MessageSquare, label: 'Conseil', path: '/conseil' },
  { icon: Settings, label: 'Parametres', path: null },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="bottom-nav">
      {NAV.map(item => {
        const active = item.path && location.pathname === item.path
        const disabled = !item.path
        const Icon = item.icon
        return (
          <button
            key={item.label}
            className={`bottom-nav-item${active ? ' active' : ''}`}
            onClick={() => !disabled && navigate(item.path)}
            disabled={disabled}
            style={{ opacity: disabled ? 0.35 : 1 }}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
