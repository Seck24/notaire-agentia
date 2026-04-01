import { Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function BandeauEssai() {
  const { profil, joursRestants } = useAuthStore()

  if (!profil || profil.statut_compte !== 'essai') return null

  const jours = joursRestants ?? 0

  const bgColor = jours > 7 ? '#2E7D32' : jours >= 4 ? '#E65100' : '#C62828'

  return (
    // DEMO MODE — masqué temporairement (ne pas supprimer)
    <div style={{
      display: 'none',
      background: bgColor,
      color: 'white',
      padding: '8px 16px',
      fontSize: '13px',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      zIndex: 200,
    }}>
      <span>
        Essai gratuit — {jours} jour{jours !== 1 ? 's' : ''} restant{jours !== 1 ? 's' : ''}
      </span>
      <Link
        to="/profil"
        style={{
          color: 'white',
          fontWeight: 700,
          textDecoration: 'underline',
          fontSize: '13px',
        }}
      >
        Passer au Pro →
      </Link>
    </div>
  )
}
