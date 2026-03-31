import { useNavigate } from 'react-router-dom'
import { FilePlus, TrendingUp, CheckCircle, Clock, Building2, FileText, Users, Gift, CreditCard, Scale, Lock, Home as HomeIcon } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const quickActions = [
  { id: 'vente_immobiliere', label: 'Acte de vente immobiliere', icon: HomeIcon, color: '#FFF8ED', iconColor: '#8B6914', desc: 'Terrain, maison, appartement...' },
  { id: 'constitution_societe', label: 'Constitution de societe', icon: Building2, color: '#E8F4F8', iconColor: '#2D6A4F', desc: 'SARL, SAS, SA, GIE...' },
  { id: 'succession', label: 'Succession', icon: Users, color: '#F3EDF8', iconColor: '#6B4C8B', desc: 'Declaration, partage...' },
  { id: 'donation', label: 'Donation', icon: Gift, color: '#FFF0E8', iconColor: '#C55A11', desc: 'Simple, partage, usufruit...' },
  { id: 'ouverture_credit', label: 'Ouverture de credit', icon: CreditCard, color: '#EBF0FF', iconColor: '#1F4E79', desc: 'Pret, hypotheque, caution...' },
]

export default function Home() {
  const navigate = useNavigate()
  const { stats } = useAppStore()

  const statsCards = [
    { label: 'Actes ce mois', value: stats.actes_ce_mois.toString(), icon: FileText, color: '#C8A882' },
    { label: 'Temps economise', value: `~${stats.temps_economise}h`, icon: Clock, color: '#6B4C2A' },
    { label: 'Actes generes', value: stats.actes_generes.toString(), icon: CheckCircle, color: '#A07050' },
  ]

  return (
    <div style={{ padding: '32px 28px', maxWidth: '960px' }}>
      {/* Hero */}
      <div className="card" style={{
        padding: '40px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, #6B4C2A 0%, #C8A882 100%)',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Scale size={26} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: 'white', fontFamily: "'Playfair Display', serif" }}>
              NotaireAgent IA
            </h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.85 }}>
              Votre assistant intelligent pour la redaction d'actes notariaux
            </p>
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: '15px', opacity: 0.9, lineHeight: 1.6, maxWidth: '600px' }}>
          Redigez vos actes notariaux en quelques minutes grace a l'intelligence artificielle.
          Precision, conformite et gain de temps garantis.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'white', color: '#6B4C2A', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FilePlus size={16} />
            Creer un acte
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {statsCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '28px', fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1A1A1A' }}>
                {value}
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#FAF6F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#5A5A5A', fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions — LARGER cards */}
      <div id="quick-actions" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1A1A1A' }}>Creer un acte</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {quickActions.map(({ id, label, icon: Icon, color, iconColor, desc }) => (
            <div
              key={id}
              className="card"
              onClick={() => navigate(`/nouvel-acte?type=${id}`)}
              style={{
                padding: '28px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'transform 0.15s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={28} color={iconColor} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
                  {label}
                </div>
                <div style={{ fontSize: '13px', color: '#9A8A7A', lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy banner */}
      <div style={{
        background: '#F0EDED',
        borderRadius: '8px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Lock size={16} color="#9A8A7A" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#5A5A5A', lineHeight: 1.5 }}>
          Aucune donnee client n'est conservee apres generation de l'acte.
        </span>
      </div>
    </div>
  )
}
