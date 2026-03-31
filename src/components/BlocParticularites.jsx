export default function BlocParticularites({ value, onChange }) {
  return (
    <div style={{
      borderLeft: '4px solid #C8A882',
      background: '#FAF6F1',
      borderRadius: '0 8px 8px 0',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 700,
        color: '#C8A882',
        marginBottom: '10px',
        fontFamily: "'Playfair Display', serif",
      }}>
        ✦ Particularités &amp; Instructions Spéciales
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={`Décrivez ici tout élément inhabituel ou instruction spécifique pour ce dossier.

Exemples :
• "Vendeur marié mais séparé de fait — vérifier consentement conjoint"
• "Bien avec ACD ancienne, chef de quartier décédé"
• "Prix volontairement bas — prévoir justificatif DGI"
• "Acquéreur souhaite clause de préférence si revente dans 5 ans"`}
        style={{
          width: '100%',
          border: '1px solid #E8DDD0',
          borderRadius: '8px',
          padding: '12px 14px',
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif",
          color: '#1A1A1A',
          background: 'white',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      />
      <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#9A8A7A', lineHeight: 1.4 }}>
        Ce champ est transmis à l'agent comme instruction prioritaire.
        Plus vous êtes précis, plus l'acte sera adapté à la situation réelle.
      </p>
    </div>
  )
}
