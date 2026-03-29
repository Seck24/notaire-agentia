import { useState, useCallback } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SCHEMAS } from '../schemas/actes'
import UploadZone from '../components/UploadZone'
import FormulaireActe from '../components/FormulaireActe'
import BoutonGenerer from '../components/BoutonGenerer'

export default function NouvelActe() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type')

  const [formData, setFormData] = useState({})
  const [files, setFiles] = useState({})
  const [showErrors, setShowErrors] = useState(false)

  const schema = SCHEMAS[type]

  // Redirect if type is invalid
  if (!type || !schema) {
    return <Navigate to="/" replace />
  }

  const handleBack = () => {
    // Check if any data has been entered
    const hasData = Object.values(formData).some((section) => {
      if (Array.isArray(section)) {
        return section.some((entry) =>
          Object.values(entry).some((v) => v !== '' && v !== undefined && v !== null)
        )
      }
      if (typeof section === 'object' && section !== null) {
        return Object.values(section).some((v) => v !== '' && v !== undefined && v !== null)
      }
      return false
    })

    const hasFiles = Object.keys(files).length > 0

    if (hasData || hasFiles) {
      const confirmed = window.confirm('Quitter ? Les donnees saisies seront perdues.')
      if (!confirmed) return
    }

    navigate('/')
  }

  const handleFormChange = useCallback((data) => {
    setFormData(data)
  }, [])

  const handleFilesChange = useCallback((f) => {
    setFiles(f)
  }, [])

  return (
    <div style={{ padding: '32px 28px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#C8A882',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0',
            marginBottom: '12px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>
        <h1 style={{
          margin: '0 0 4px',
          fontSize: '26px',
          color: '#1A1A1A',
          fontFamily: "'Playfair Display', serif",
        }}>
          {schema.label}
        </h1>
        <p style={{ margin: 0, color: '#5A5A5A', fontSize: '14px' }}>
          Remplissez les informations et chargez les documents necessaires.
        </p>
      </div>

      {/* Upload Zone */}
      <div style={{ marginBottom: '32px' }}>
        <UploadZone
          documents_requis={schema.documents_requis}
          onFilesChange={handleFilesChange}
        />
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: '#E8DDD0', marginBottom: '32px' }} />

      {/* Formulaire */}
      <div style={{ marginBottom: '32px' }}>
        <FormulaireActe
          typeActe={type}
          initialData={{}}
          onChange={handleFormChange}
          showErrors={showErrors}
        />
      </div>

      {/* Separator */}
      <div style={{ height: '1px', background: '#E8DDD0', marginBottom: '32px' }} />

      {/* Bouton Generer */}
      <BoutonGenerer
        formData={formData}
        files={files}
        schema={schema}
        typeActe={type}
      />
    </div>
  )
}
