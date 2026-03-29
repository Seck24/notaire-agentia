import { NavLink } from 'react-router-dom'
import { Home, FilePlus, User, Scale } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/nouvel-acte', icon: FilePlus, label: 'Nouvel Acte' },
  { to: '/profil', icon: User, label: 'Profil' },
]

export default function Sidebar() {
  const { profil, joursRestants } = useAuthStore()

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: 'white',
      borderRight: '1px solid #E8DDD0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #E8DDD0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#C8A882',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Scale size={20} color="white" />
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '15px',
              color: '#6B4C2A',
              lineHeight: 1.2,
            }}>
              NotaireAgent
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: '13px',
              color: '#C8A882',
              lineHeight: 1.2,
            }}>
              IA
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              marginBottom: '4px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#6B4C2A' : '#5A5A5A',
              background: isActive ? '#FAF6F1' : 'transparent',
              borderLeft: isActive ? '3px solid #C8A882' : '3px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Cabinet info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #E8DDD0',
        background: '#FAF6F1',
      }}>
        <div style={{ fontSize: '11px', color: '#9A8A7A', marginBottom: '4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Cabinet
        </div>
        <div style={{ fontSize: '13px', color: '#6B4C2A', fontWeight: 600 }}>
          {profil?.nom_cabinet || 'Etude Notariale'}
        </div>
        {profil?.statut_compte === 'essai' && joursRestants != null && (
          <div style={{
            marginTop: '6px',
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
            background: joursRestants > 7 ? '#E8F5E9' : joursRestants >= 4 ? '#FFF3E0' : '#FFEBEE',
            color: joursRestants > 7 ? '#2E7D32' : joursRestants >= 4 ? '#E65100' : '#C62828',
          }}>
            {joursRestants}j restants
          </div>
        )}
      </div>
    </aside>
  )
}
