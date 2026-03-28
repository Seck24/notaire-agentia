import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, FileDown } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const loadingMessages = [
  "L'agent analyse les documents...",
  "Interrogation des textes legaux...",
  "Redaction de l'acte en cours...",
]

export default function BoutonGenerer({ formData, files, schema, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [missingItems, setMissingItems] = useState([])
  const [showMissing, setShowMissing] = useState(false)
  const { incrementActes } = useAppStore()

  const validate = () => {
    const missing = []

    if (!schema) return missing

    // Check required fields
    schema.sections.forEach((section) => {
      if (section.repetable) {
        const entries = formData[section.id] || []
        entries.forEach((entry, idx) => {
          section.fields.forEach((field) => {
            if (field.required && !entry[field.id]) {
              missing.push(`${section.label} #${idx + 1} : ${field.label}`)
            }
          })
        })
      } else {
        const sectionData = formData[section.id] || {}
        section.fields.forEach((field) => {
          if (field.required && !sectionData[field.id]) {
            missing.push(`${section.label} : ${field.label}`)
          }
        })
      }
    })

    // Check required documents
    if (schema.documents_requis) {
      schema.documents_requis.forEach((doc) => {
        if (doc.required && (!files || !files[doc.id])) {
          missing.push(`Document : ${doc.label}`)
        }
      })
    }

    return missing
  }

  const handleGenerate = async () => {
    const missing = validate()
    if (missing.length > 0) {
      setMissingItems(missing)
      setShowMissing(true)
      return
    }

    setShowMissing(false)
    setMissingItems([])
    setIsGenerating(true)
    setLoadingStep(0)

    for (let i = 0; i < loadingMessages.length; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      setLoadingStep(i + 1)
    }

    await new Promise((r) => setTimeout(r, 500))

    // Increment stats
    incrementActes()

    // Download placeholder file
    const content = `ACTE NOTARIE - ${schema.label}\n\nGenere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}\n\n---\n\nCet acte a ete genere par NotaireAgent IA.\nCe document est un draft et doit etre verifie par un notaire.\n\n---\n\nDonnees du formulaire :\n${JSON.stringify(formData, null, 2)}\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${schema.label.replace(/\s+/g, '_')}_draft.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsGenerating(false)
    setGenerated(true)

    if (onGenerate) onGenerate()
  }

  if (generated) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#E8F5E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle size={28} color="#2E7D32" />
        </div>
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '20px',
          color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          Draft genere avec succes
        </h3>
        <p style={{ margin: '0 0 20px', color: '#5A5A5A', fontSize: '14px' }}>
          Le fichier a ete telecharge automatiquement.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#6B4C2A', fontSize: '13px' }}>
          <FileDown size={16} />
          {schema.label.replace(/\s+/g, '_')}_draft.txt
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FAF6F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Loader2 size={28} color="#C8A882" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <h3 style={{
          margin: '0 0 8px',
          fontSize: '18px',
          color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          Generation en cours...
        </h3>
        <p style={{ margin: '0 0 24px', color: '#C8A882', fontSize: '14px', fontWeight: 500 }}>
          {loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)]}
        </p>
        {/* Progress bar */}
        <div style={{
          background: '#E8DDD0',
          borderRadius: '4px',
          height: '6px',
          overflow: 'hidden',
          maxWidth: '300px',
          margin: '0 auto 24px',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #C8A882, #6B4C2A)',
            borderRadius: '4px',
            width: `${(loadingStep / loadingMessages.length) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        {/* Steps */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '320px',
          margin: '0 auto',
          textAlign: 'left',
        }}>
          {loadingMessages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: idx < loadingStep ? '#6B4C2A' : '#C4B8AA',
              opacity: idx >= loadingStep + 1 ? 0.4 : 1,
            }}>
              {idx < loadingStep
                ? <CheckCircle size={14} color="#6B4C2A" />
                : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid currentColor', flexShrink: 0 }} />
              }
              {msg}
            </div>
          ))}
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px',
        fontSize: '18px',
        color: '#1A1A1A',
        fontFamily: "'Playfair Display', serif",
      }}>
        Generer l'acte
      </h3>

      {showMissing && missingItems.length > 0 && (
        <div style={{
          background: '#FFF3E0',
          border: '1px solid #FFCC80',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            color: '#E65100',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            <AlertCircle size={18} />
            Elements manquants ({missingItems.length})
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            listStyleType: 'disc',
          }}>
            {missingItems.map((item, idx) => (
              <li key={idx} style={{ fontSize: '12px', color: '#BF360C', marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleGenerate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px',
          padding: '14px 28px',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Loader2 size={18} />
        Generer le draft de l'acte
      </button>
    </div>
  )
}
