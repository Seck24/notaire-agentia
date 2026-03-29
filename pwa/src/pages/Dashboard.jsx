import { useNavigate } from 'react-router-dom'
import { Home, Building2, Scale, Heart, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const ICONS = { Home, Building2, Scale, Heart, CreditCard }

const ACTES = [
  { id: 'vente_immobiliere', icon: 'Home', label: 'Vente immobiliere', desc: 'Transfert de propriete fonciere', badge: 'frequent' },
  { id: 'constitution_societe', icon: 'Building2', label: 'Constitution societe', desc: 'SARL, SA, SAEM — droit OHADA' },
  { id: 'succession', icon: 'Scale', label: 'Succession', desc: 'Heritiers, actif, passif' },
  { id: 'donation', icon: 'Heart', label: 'Donation', desc: 'Transfert entre vifs' },
  { id: 'ouverture_credit', icon: 'CreditCard', label: 'Ouverture de credit', desc: 'Hypotheques et suretes' },
]

const RAG_SOURCES = [
  'Code Civil CI',
  'Actes OHADA',
  'Tarifs notariaux',
  'Modeles etude',
  'Droit foncier',
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { cabinet } = useAuth()

  return (
    <Layout>
      <div className="animate-fade-in" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 300, color: 'var(--text)', margin: 0 }}>
            Bonjour, {cabinet?.nom_cabinet?.split(' ').slice(-1)[0] || 'Maitre'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            Plateforme de generation d'actes notariaux par IA
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* Main content */}
          <div style={{ flex: 1 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { value: '12', label: 'Actes generes', sub: 'ce mois' },
                { value: '18h', label: 'Temps gagne', sub: 'estimation' },
                { value: '5', label: 'Types d\'actes', sub: 'disponibles' },
              ].map(stat => (
                <div key={stat.label} className="card" style={{ padding: 20 }}>
                  <div className="font-display" style={{ fontSize: 36, color: 'var(--gold)', fontWeight: 400 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Actes grid */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="section-title" style={{ margin: 0 }}>Generer un acte</div>
              <div
                onClick={() => navigate('/nouvel-acte')}
                style={{ fontSize: 11, color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Nouveau <ArrowRight size={11} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {ACTES.map(acte => {
                const Icon = ICONS[acte.icon]
                return (
                  <div
                    key={acte.id}
                    className="card"
                    onClick={() => navigate(`/nouvel-acte?type=${acte.id}`)}
                    style={{ padding: 18, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--gold-border)'
                      e.currentTarget.style.boxShadow = '0 0 20px var(--gold-glow)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                      <Icon size={16} color="var(--gold)" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{acte.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{acte.desc}</div>
                    {acte.badge && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: 8,
                        fontSize: 9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--blue)',
                        background: 'var(--blue-glow)',
                        border: '1px solid var(--blue-border)',
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}>
                        {acte.badge}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{ width: 260, flexShrink: 0 }}>
            {/* RAG status */}
            <div className="card" style={{ padding: 18, marginBottom: 12 }}>
              <div className="section-title">Base RAG</div>
              {RAG_SOURCES.map(src => (
                <div key={src} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--text)' }}>
                  <CheckCircle2 size={12} color="var(--green)" strokeWidth={2} />
                  {src}
                </div>
              ))}
            </div>

            {/* Recent */}
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">Derniers actes</div>
              {[
                { type: 'Vente immobiliere', date: '27 Mars 2026' },
                { type: 'Constitution SARL', date: '25 Mars 2026' },
                { type: 'Donation', date: '22 Mars 2026' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 10 : 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{item.type}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--dim)' }}>{item.date}</span>
                    <span style={{
                      fontSize: 9,
                      color: 'var(--gold)',
                      background: 'var(--gold-glow)',
                      borderRadius: 3,
                      padding: '1px 5px',
                    }}>
                      Draft
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
