import { useMemo } from 'react'

function calculerCompletude(schema, formData) {
  if (!schema) return { pct: 0, manquants: [], total: 0, remplis: 0 }

  const requis = []
  const optionnels = []

  schema.sections.forEach((section) => {
    if (section.repetable) {
      const entries = formData[section.id] || []
      section.fields.forEach((field) => {
        if (field.required) {
          const filled = entries.some((e) => e[field.id] && String(e[field.id]).trim())
          if (!filled) requis.push(`${section.label} : ${field.label}`)
        } else {
          const filled = entries.some((e) => e[field.id] && String(e[field.id]).trim())
          if (!filled) optionnels.push(`${section.label} : ${field.label}`)
        }
      })
    } else {
      const sectionData = formData[section.id] || {}
      section.fields.forEach((field) => {
        const val = sectionData[field.id]
        const filled = val && String(val).trim()
        if (field.required) {
          if (!filled) requis.push(`${section.label} : ${field.label}`)
        } else {
          if (!filled) optionnels.push(`${section.label} : ${field.label}`)
        }
      })
    }
  })

  const totalReq = schema.sections.reduce((acc, s) => acc + s.fields.filter((f) => f.required).length, 0)
  const remplisReq = totalReq - requis.length
  const pct = totalReq === 0 ? 100 : Math.round((remplisReq / totalReq) * 100)

  return { pct, manquants: requis, optionnels, total: totalReq, remplis: remplisReq }
}

export default function BarreCompletude({ schema, formData }) {
  const { pct, manquants, optionnels } = useMemo(
    () => calculerCompletude(schema, formData),
    [schema, formData]
  )

  const couleur = pct >= 100
    ? '#C8A882'
    : pct >= 85
      ? '#2E7D32'
      : pct >= 60
        ? '#E65100'
        : '#C62828'

  const label = pct >= 100
    ? 'Dossier complet'
    : pct >= 85
      ? 'Presque complet'
      : pct >= 60
        ? 'Incomplet'
        : 'Incomplet'

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
          Complétude du formulaire
        </span>
        <span style={{
          fontSize: '14px', fontWeight: 700, color: couleur,
          animation: pct >= 100 ? 'pulse 2s infinite' : 'none',
        }}>
          {pct}% — {label}
        </span>
      </div>

      <div style={{ background: '#E8DDD0', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{
          height: '100%',
          background: couleur,
          borderRadius: '4px',
          width: `${pct}%`,
          transition: 'width 0.4s ease, background-color 0.3s ease',
        }} />
      </div>

      {manquants.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5A5A', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Champs obligatoires manquants ({manquants.length})
          </div>
          <ul style={{ margin: '0', padding: '0 0 0 14px', listStyleType: 'disc' }}>
            {manquants.slice(0, 5).map((m, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#C62828', marginBottom: '2px' }}>{m}</li>
            ))}
            {manquants.length > 5 && (
              <li style={{ fontSize: '12px', color: '#9A8A7A' }}>+ {manquants.length - 5} autres…</li>
            )}
          </ul>
        </div>
      )}

      {pct >= 85 && pct < 100 && optionnels && optionnels.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: '#9A8A7A' }}>
            {optionnels.length} champ{optionnels.length > 1 ? 's' : ''} optionnel{optionnels.length > 1 ? 's' : ''} à compléter si disponible
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }`}</style>
    </div>
  )
}

export { calculerCompletude }
