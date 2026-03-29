import { useNavigate } from 'react-router-dom'
import { Lock, LogOut, Check } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const plans = [
  {
    nom: 'Starter',
    prix: '25 000',
    features: ['10 actes / mois', 'Types de base', 'Support email'],
    highlighted: false,
  },
  {
    nom: 'Pro',
    prix: '65 000',
    features: ['50 actes / mois', 'Tous types d\'actes', 'Upload documents', 'Support prioritaire'],
    highlighted: true,
  },
  {
    nom: 'Cabinet',
    prix: '120 000',
    features: ['Actes illimites', 'Multi-utilisateurs', 'API personnalisee', 'Support dedie'],
    highlighted: false,
  },
]

export default function Expiration() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F0EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
        {/* Header */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#FFEBEE', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Lock size={28} color="#C62828" />
        </div>

        <h1 style={{
          margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          Votre periode d'essai est terminee
        </h1>
        <p style={{ margin: '0 0 40px', fontSize: '15px', color: '#9A8A7A' }}>
          Choisissez un plan pour continuer a utiliser NotaireAgent IA
        </p>

        {/* Plans */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          {plans.map((plan) => (
            <div
              key={plan.nom}
              className="card"
              style={{
                padding: '28px 24px',
                border: plan.highlighted ? '2px solid #C8A882' : '1px solid #E8DDD0',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {plan.highlighted && (
                <div style={{
                  position: 'absolute', top: '0', right: '0',
                  background: '#C8A882', color: 'white', fontSize: '10px',
                  fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Populaire
                </div>
              )}

              <h3 style={{
                margin: '0 0 4px', fontSize: '18px', color: '#1A1A1A',
                fontFamily: "'Playfair Display', serif",
              }}>
                {plan.nom}
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#6B4C2A' }}>
                  {plan.prix}
                </span>
                <span style={{ fontSize: '13px', color: '#9A8A7A' }}> FCFA/mois</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '13px', color: '#5A5A5A', marginBottom: '8px',
                  }}>
                    <Check size={14} color="#C8A882" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <a
            href="mailto:contact@preo-ia.info"
            className="btn-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              fontSize: '15px', padding: '14px 32px', textDecoration: 'none',
            }}
          >
            Nous contacter
          </a>

          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#9A8A7A', fontFamily: "'Inter', sans-serif",
              padding: '8px',
            }}
          >
            <LogOut size={14} />
            Se deconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
