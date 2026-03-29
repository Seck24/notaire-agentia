import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, FileDown, AlertTriangle } from 'lucide-react'
import useAppStore from '../store/useAppStore'
import useAuthStore from '../store/useAuthStore'

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://automation.preo-ia.info/webhook'

const loadingMessages = [
  "Analyse des documents en cours...",
  "Consultation des textes legaux...",
  "Redaction de l'acte en cours...",
  "Mise en forme du document Word...",
]

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function base64ToBlob(b64, mimeType) {
  const byteChars = atob(b64)
  const byteArrays = []
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    byteArrays.push(new Uint8Array(byteNumbers))
  }
  return new Blob(byteArrays, { type: mimeType })
}

export default function BoutonGenerer({ formData, files, schema, typeActe, onGenerate }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [downloadFilename, setDownloadFilename] = useState('')
  const [missingItems, setMissingItems] = useState([])
  const [showMissing, setShowMissing] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [avertissement, setAvertissement] = useState(null)
  const { incrementActes } = useAppStore()
  const { profil } = useAuthStore()
  const cabinetToken = profil?.token_api || ''

  const validate = () => {
    const missingFields = []
    if (!schema) return missingFields

    schema.sections.forEach((section) => {
      if (section.repetable) {
        const entries = formData[section.id] || []
        entries.forEach((entry, idx) => {
          section.fields.forEach((field) => {
            if (field.required && !entry[field.id]) {
              missingFields.push(`${section.label} #${idx + 1} : ${field.label}`)
            }
          })
        })
      } else {
        const sectionData = formData[section.id] || {}
        section.fields.forEach((field) => {
          if (field.required && !sectionData[field.id]) {
            missingFields.push(`${section.label} : ${field.label}`)
          }
        })
      }
    })

    return missingFields
  }

  const checkDocuments = () => {
    if (!schema || !schema.documents_requis) return { hasAny: false, missingCount: 0 }
    const totalDocs = schema.documents_requis.length
    const uploadedCount = files ? Object.keys(files).filter(k => !k.startsWith('extra_')).length : 0
    return { hasAny: uploadedCount > 0, missingCount: totalDocs - uploadedCount }
  }

  const handleGenerate = async () => {
    // Only form fields are blocking
    const missingFields = validate()
    if (missingFields.length > 0) {
      setMissingItems(missingFields)
      setShowMissing(true)
      return
    }

    // Documents are optional — just warn
    const docStatus = checkDocuments()
    if (!docStatus.hasAny) {
      setAvertissement("Aucun document fourni — l'acte sera redige uniquement depuis les informations saisies manuellement.")
    } else if (docStatus.missingCount > 0) {
      setAvertissement("Certains documents n'ont pas ete fournis. L'acte sera genere avec les documents disponibles.")
    }

    setShowMissing(false)
    setMissingItems([])
    setErreur(null)
    setIsGenerating(true)
    setLoadingStep(0)

    try {
      // Prepare documents as base64
      const documentsBase64 = []
      if (files) {
        for (const [docId, file] of Object.entries(files)) {
          if (file instanceof File) {
            const data = await fileToBase64(file)
            documentsBase64.push({
              nom: file.name,
              doc_id: docId,
              media_type: file.type || 'application/octet-stream',
              data,
            })
          }
        }
      }

      // Step 1: send to n8n
      setLoadingStep(0)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await fetch(`${WEBHOOK_URL}/generer-acte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cabinet-Token': cabinetToken,
        },
        body: JSON.stringify({
          type_acte: typeActe,
          form_data: formData,
          documents: documentsBase64,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Progress simulation while waiting
      const progressInterval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, loadingMessages.length - 1))
      }, 3000)

      if (!response.ok) {
        clearInterval(progressInterval)
        if (response.status === 401) {
          throw new Error('Cabinet non reconnu. Verifiez vos parametres.')
        }
        throw new Error(`Erreur serveur (${response.status})`)
      }

      const result = await response.json()
      clearInterval(progressInterval)
      setLoadingStep(loadingMessages.length)

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la generation')
      }

      // Download the Word file
      const blob = base64ToBlob(
        result.docx_base64,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename || `draft_${typeActe}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDownloadFilename(result.filename || `draft_${typeActe}.docx`)

      // Increment stats
      incrementActes()

      // Show warning
      if (result.avertissement) {
        setAvertissement(result.avertissement)
      }

      setIsGenerating(false)
      setGenerated(true)

      if (onGenerate) onGenerate(result)
    } catch (error) {
      setIsGenerating(false)

      if (error.name === 'AbortError') {
        setErreur('La generation prend trop de temps. Reessayez dans un instant.')
      } else {
        setErreur(error.message || 'Erreur technique. Contactez le support Preo-IA.')
      }
    }
  }

  if (generated) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#E8F5E9', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <CheckCircle size={28} color="#2E7D32" />
        </div>
        <h3 style={{
          margin: '0 0 8px', fontSize: '20px', color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          Draft genere avec succes
        </h3>
        <p style={{ margin: '0 0 16px', color: '#5A5A5A', fontSize: '14px' }}>
          Le document Word a ete telecharge automatiquement.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          justifyContent: 'center', color: '#6B4C2A', fontSize: '13px',
          marginBottom: '16px',
        }}>
          <FileDown size={16} />
          {downloadFilename}
        </div>

        {avertissement && (
          <div style={{
            background: '#FFF8E1', border: '1px solid #FFE082',
            borderRadius: '8px', padding: '12px', marginTop: '16px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            textAlign: 'left',
          }}>
            <AlertTriangle size={18} color="#F9A825" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#5D4037', lineHeight: 1.5 }}>
              {avertissement}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#FAF6F1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Loader2 size={28} color="#C8A882" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <h3 style={{
          margin: '0 0 8px', fontSize: '18px', color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          Generation en cours...
        </h3>
        <p style={{ margin: '0 0 24px', color: '#C8A882', fontSize: '14px', fontWeight: 500 }}>
          {loadingMessages[Math.min(loadingStep, loadingMessages.length - 1)]}
        </p>
        <div style={{
          background: '#E8DDD0', borderRadius: '4px', height: '6px',
          overflow: 'hidden', maxWidth: '300px', margin: '0 auto 24px',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #C8A882, #6B4C2A)',
            borderRadius: '4px',
            width: `${((loadingStep + 1) / loadingMessages.length) * 100}%`,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          maxWidth: '320px', margin: '0 auto', textAlign: 'left',
        }}>
          {loadingMessages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '13px',
              color: idx <= loadingStep ? '#6B4C2A' : '#C4B8AA',
              opacity: idx > loadingStep + 1 ? 0.4 : 1,
            }}>
              {idx < loadingStep
                ? <CheckCircle size={14} color="#6B4C2A" />
                : idx === loadingStep
                  ? <Loader2 size={14} color="#C8A882" style={{ animation: 'spin 1s linear infinite' }} />
                  : <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid currentColor', flexShrink: 0 }} />
              }
              {msg}
            </div>
          ))}
        </div>
        <p style={{ margin: '24px 0 0', fontSize: '12px', color: '#9A8A7A' }}>
          Cela peut prendre jusqu'a 2 minutes...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px', fontSize: '18px', color: '#1A1A1A',
        fontFamily: "'Playfair Display', serif",
      }}>
        Generer l'acte
      </h3>

      {erreur && (
        <div style={{
          background: '#FFEBEE', border: '1px solid #EF9A9A',
          borderRadius: '8px', padding: '16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <AlertCircle size={18} color="#C62828" />
          <p style={{ margin: 0, fontSize: '13px', color: '#B71C1C' }}>{erreur}</p>
        </div>
      )}

      {showMissing && missingItems.length > 0 && (
        <div style={{
          background: '#FFF3E0', border: '1px solid #FFCC80',
          borderRadius: '8px', padding: '16px', marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '10px', color: '#E65100', fontSize: '14px', fontWeight: 600,
          }}>
            <AlertCircle size={18} />
            Champs obligatoires manquants ({missingItems.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {missingItems.map((item, idx) => (
              <li key={idx} style={{ fontSize: '12px', color: '#BF360C', marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!showMissing && (() => {
        const ds = checkDocuments()
        if (!ds.hasAny) return (
          <div style={{
            background: '#FFFDE7', border: '1px solid #FFF9C4',
            borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={16} color="#F9A825" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#6D5F00', lineHeight: 1.4 }}>
              Aucun document fourni — l'acte sera redige uniquement depuis les informations saisies manuellement.
            </p>
          </div>
        )
        if (ds.missingCount > 0) return (
          <div style={{
            background: '#FFFDE7', border: '1px solid #FFF9C4',
            borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={16} color="#F9A825" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#6D5F00', lineHeight: 1.4 }}>
              Certains documents n'ont pas ete fournis. L'acte sera genere avec les documents disponibles.
            </p>
          </div>
        )
        return null
      })()}

      <button
        className="btn-primary"
        onClick={handleGenerate}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '15px', padding: '14px 28px', width: '100%',
          justifyContent: 'center',
        }}
      >
        <FileDown size={18} />
        Generer le draft Word
      </button>
    </div>
  )
}
