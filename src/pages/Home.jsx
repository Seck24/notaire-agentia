import { useNavigate } from 'react-router-dom'
import { FilePlus, FolderOpen, TrendingUp, CheckCircle, Clock, Building2, FileText, Users, Gift, CreditCard, ArrowRight, Scale } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const stats = [
  { label: 'Actes ce mois', value: '0', icon: FileText, color: '#C8A882' },
  { label: 'Dossiers en cours', value: '0', icon: FolderOpen, color: '#D4956A' },
  { label: 'Temps économisé', value: '~0h', icon: Clock, color: '#6B4C2A' },
  { label: 'Actes validés', value: '0', icon: CheckCircle, color: '#A07050' },
]

const quickActions = [
  { label: 'Constitution société', icon: Building2, color: '#E8F4F8', iconColor: '#2B7A9A', desc: 'SARL, SAS, SA...' },
  { label: 'Acte de vente', icon: FileText, color: '#F0F8E8', iconColor: '#4A8A2B', desc: 'Immobilier, fonds...' },
  { label: 'Succession', icon: Users, color: '#F8F0E8', iconColor: '#9A6B2B', desc: 'Déclaration, partage...' },
  { label: 'Donation', icon: Gift, color: '#F8E8F0', iconColor: '#9A2B7A', desc: 'Simple, partage...' },
  { label: 'Ouverture crédit', icon: CreditCard, color: '#EBF0FF', iconColor: '#2B4A9A', desc: 'Prêt, hypothèque...' },
]

export default function Home() {
  const navigate = useNavigate()
  const { dossiers } = useAppStore()

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
              Votre assistant intelligent pour la rédaction d'actes notariaux
            </p>
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: '15px', opacity: 0.9, lineHeight: 1.6, maxWidth: '600px' }}>
          Rédigez vos actes notariaux en quelques minutes grâce à l'intelligence artificielle.
          Précision, conformité et gain de temps garantis.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/nouvel-acte')}
            style={{ background: 'white', color: '#6B4C2A', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FilePlus size={16} />
            Créer un acte
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/dossiers')}
            style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FolderOpen size={16} />
            Mes dossiers
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
        {stats.map(({ label, value, icon: Icon, color }) => (
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

      {/* Quick actions */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1A1A1A' }}>Actions rapides</h2>
          <button
            onClick={() => navigate('/nouvel-acte')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#C8A882', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Voir tout <ArrowRight size={14} />
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {quickActions.map(({ label, icon: Icon, color, iconColor, desc }) => (
            <div
              key={label}
              className="card"
              onClick={() => navigate('/nouvel-acte')}
              style={{ padding: '20px 16px', cursor: 'pointer', textAlign: 'center' }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <Icon size={22} color={iconColor} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontSize: '11px', color: '#9A8A7A' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent dossiers */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: '20px', color: '#1A1A1A' }}>Dossiers récents</h2>
        {dossiers.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FAF6F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FolderOpen size={28} color="#C8A882" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1A1A1A' }}>Aucun dossier pour l'instant</h3>
            <p style={{ margin: '0 0 20px', color: '#5A5A5A', fontSize: '14px' }}>
              Créez votre premier acte notarial pour démarrer
            </p>
            <button className="btn-primary" onClick={() => navigate('/nouvel-acte')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FilePlus size={16} />
              Créer mon premier acte
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dossiers.slice(0, 5).map((d) => (
              <div key={d.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{d.type}</div>
                  <div style={{ fontSize: '12px', color: '#9A8A7A', marginTop: '2px' }}>{d.date}</div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: '#FAF6F1',
                  color: '#6B4C2A',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
