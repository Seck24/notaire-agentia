import { AlertTriangle, AlertCircle, CheckCircle2, Search } from 'lucide-react'

export default function DiagnosticPanel({ diagnostic, onCorrect, onGenerate }) {
  const { alertes, points, completude, champsVides } = diagnostic

  const completudeColor = completude === 100
    ? 'var(--gold)'
    : completude > 85
    ? 'var(--green)'
    : completude >= 60
    ? '#e0a030'
    : 'var(--red)'

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Search size={20} color="var(--gold)" strokeWidth={1.5} />
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 300, margin: 0 }}>
          Analyse du Dossier
        </h2>
      </div>

      {/* Alertes critiques */}
      {alertes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            Alerte critique ({alertes.length})
          </div>
          {alertes.map((a, i) => (
            <div key={i} className="diagnostic-card diagnostic-critique">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={14} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{a.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Points d'attention */}
      {points.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e0a030', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e0a030', display: 'inline-block' }} />
            Point d'attention ({points.length})
          </div>
          {points.map((p, i) => (
            <div key={i} className="diagnostic-card diagnostic-attention">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={14} color="#e0a030" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{p.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aucune alerte */}
      {alertes.length === 0 && points.length === 0 && (
        <div className="diagnostic-card diagnostic-ok" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} color="var(--green)" />
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Aucun point d'alerte detecte</span>
          </div>
        </div>
      )}

      {/* Completude */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color={completudeColor} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Completude</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: completudeColor }}>{completude}%</span>
        </div>
        <div className="completude-bar">
          <div
            className={`completude-fill${completude === 100 ? ' completude-perfect' : ''}`}
            style={{ width: `${completude}%`, background: completudeColor }}
          />
        </div>
        {champsVides.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--dim)' }}>
            {champsVides.length} champ{champsVides.length > 1 ? 's' : ''} manquant{champsVides.length > 1 ? 's' : ''} :{' '}
            <span style={{ color: 'var(--muted)' }}>
              {champsVides.map(c => c.replace(/_/g, ' ')).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn-ghost" onClick={onCorrect}>Corriger d'abord</button>
        <button className="btn-gold" onClick={onGenerate}>
          {alertes.length > 0 ? 'Generer quand meme' : 'Generer l\'acte'}
        </button>
      </div>
    </div>
  )
}
