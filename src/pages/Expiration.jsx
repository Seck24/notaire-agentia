import { useNavigate } from 'react-router-dom'
import { Check, LogOut, MessageCircle, Mail } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const WHATSAPP_NUMBER = '22500000000' // À remplacer par le vrai numéro
const EMAIL = 'contact@preo-ia.info'

export default function Expiration() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Bonjour, je souhaite activer mon compte NotaireAgent IA. " +
      "Voici ma preuve de paiement de 50 000 FCFA."
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`)
  }

  const handleEmail = () => {
    window.open(
      `mailto:${EMAIL}` +
      `?subject=Activation compte NotaireAgent IA` +
      `&body=Bonjour, je souhaite activer mon compte. ` +
      `Veuillez trouver ci-joint ma preuve de paiement.`
    )
  }

  const features = [
    'Tous les types d\'actes',
    'Upload de documents',
    'Mode Conseil juridique',
    'Actes illimités',
    'Support par email',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F0EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h1 style={{
          margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif", textAlign: 'center',
        }}>
          Activez votre compte
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#9A8A7A', textAlign: 'center' }}>
          Accédez à toutes les fonctionnalités de NotaireAgent IA
        </p>

        {/* Plan unique */}
        <div className="card" style={{
          padding: '28px 24px', marginBottom: '20px',
          border: '2px solid #C8A882',
        }}>
          <h3 style={{
            margin: '0 0 4px', fontSize: '20px', color: '#1A1A1A',
            fontFamily: "'Playfair Display', serif",
          }}>
            NotaireAgent IA
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#6B4C2A' }}>50 000</span>
            <span style={{ fontSize: '14px', color: '#9A8A7A' }}> FCFA / mois</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {features.map((feat) => (
              <li key={feat} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '14px', color: '#5A5A5A', marginBottom: '10px',
              }}>
                <Check size={16} color="#C8A882" style={{ flexShrink: 0 }} />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions activation */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>
            Comment activer votre compte :
          </h3>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
            <li style={{ fontSize: '14px', color: '#5A5A5A', marginBottom: '10px' }}>
              Effectuez un virement ou paiement mobile de <strong style={{ color: '#1A1A1A' }}>50 000 FCFA</strong>
            </li>
            <li style={{ fontSize: '14px', color: '#5A5A5A', marginBottom: '10px' }}>
              Envoyez la preuve de paiement par WhatsApp ou email :
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', color: '#6B4C2A' }}>📱 WhatsApp : +225 00 00 00 00 00</span>
                <span style={{ fontSize: '13px', color: '#6B4C2A' }}>📧 Email : {EMAIL}</span>
              </div>
            </li>
            <li style={{ fontSize: '14px', color: '#5A5A5A' }}>
              Votre compte sera activé sous <strong style={{ color: '#1A1A1A' }}>24h</strong>
            </li>
          </ol>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={handleWhatsApp}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', padding: '14px' }}
          >
            <MessageCircle size={18} />
            Envoyer sur WhatsApp
          </button>
          <button
            onClick={handleEmail}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', border: '1px solid #C8A882', borderRadius: '8px',
              background: 'white', cursor: 'pointer', fontSize: '15px', color: '#6B4C2A',
              fontFamily: "'Inter', sans-serif", fontWeight: 600,
            }}
          >
            <Mail size={18} />
            Envoyer par email
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
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
