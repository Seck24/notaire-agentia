import { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, Sparkles, AlertTriangle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function UploadZone({ onFilesChange, onExtract, typeActe }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractDone, setExtractDone] = useState(false)
  const fileInputRef = useRef(null)

  const updateParent = (newFiles) => {
    if (onFilesChange) {
      const allFiles = {}
      newFiles.forEach((file, idx) => {
        allFiles[`doc_${idx}`] = file
      })
      onFilesChange(allFiles)
    }
  }

  const lancerExtraction = async (newFiles) => {
    if (!API_URL || !onExtract) return
    if (newFiles.length === 0) return

    setExtracting(true)
    setExtractDone(false)
    try {
      const fd = new FormData()
      newFiles.forEach((f) => fd.append('files', f))
      fd.append('type_acte', typeActe || '')

      const res = await fetch(`${API_URL}/api/extraire-documents`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('extraction failed')
      const data = await res.json()
      if (data.champs && Object.keys(data.champs).length > 0) {
        onExtract(data.champs)
        setExtractDone(true)
      }
    } catch (e) {
      // Silencieux si backend indisponible
    } finally {
      setExtracting(false)
    }
  }

  const addFiles = (newFiles) => {
    const updated = [...files, ...Array.from(newFiles)]
    setFiles(updated)
    updateParent(updated)
    lancerExtraction(updated)
  }

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx)
    setFiles(updated)
    updateParent(updated)
    setExtractDone(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
          Documents du dossier
        </h3>
        {extracting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C8A882', fontSize: '12px' }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            Extraction en cours…
          </div>
        )}
        {extractDone && !extracting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '12px' }}>
            <Sparkles size={14} />
            Formulaire pré-rempli
          </div>
        )}
      </div>
      <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#9A8A7A' }}>
        Optionnel — déposez les documents pour pré-remplissage automatique
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#C8A882' : '#E8DDD0'}`,
          borderRadius: '10px',
          padding: '28px 20px',
          textAlign: 'center',
          background: isDragging ? '#FAF6F1' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: files.length > 0 ? '14px' : '0',
        }}
      >
        <Upload size={24} color={isDragging ? '#C8A882' : '#C4B8AA'} style={{ margin: '0 auto 10px', display: 'block' }} />
        <p style={{ margin: 0, fontSize: '13px', color: '#5A5A5A', fontWeight: 500 }}>
          Glissez vos documents ici ou <span style={{ color: '#C8A882', fontWeight: 700 }}>cliquez pour charger</span>
        </p>
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#9A8A7A' }}>
          PDF, Word, images — tous types acceptés
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files) }}
          style={{ display: 'none' }}
        />
      </div>

      {/* File cards */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {files.map((file, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'white',
              border: '1px solid #E8DDD0',
              borderRadius: '8px',
            }}>
              <FileText size={16} color="#C8A882" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9A8A7A' }}>{formatSize(file.size)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A', padding: '4px', flexShrink: 0, display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        marginTop: '10px', padding: '10px 14px',
        background: '#F5F0EB', borderRadius: '8px',
      }}>
        <AlertTriangle size={13} color="#9A8A7A" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#9A8A7A', lineHeight: 1.4 }}>
          Documents analysés et supprimés après extraction — aucune donnée conservée.
        </span>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
