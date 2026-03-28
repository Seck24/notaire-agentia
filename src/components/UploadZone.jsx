import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertTriangle, X, FileText, Plus } from 'lucide-react'

export default function UploadZone({ documents_requis = [], onFilesChange }) {
  const [docFiles, setDocFiles] = useState({})
  const [extraFiles, setExtraFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragTarget, setDragTarget] = useState(null)
  const fileInputRefs = useRef({})
  const extraFileRef = useRef(null)

  const updateParent = (newDocFiles, newExtraFiles) => {
    if (onFilesChange) {
      const allFiles = {}
      Object.entries(newDocFiles).forEach(([docId, file]) => {
        allFiles[docId] = file
      })
      newExtraFiles.forEach((file, idx) => {
        allFiles[`extra_${idx}`] = file
      })
      onFilesChange(allFiles)
    }
  }

  const handleDocUpload = (docId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const updated = { ...docFiles, [docId]: file }
    setDocFiles(updated)
    updateParent(updated, extraFiles)
  }

  const handleDocDrop = (docId, e) => {
    e.preventDefault()
    setIsDragging(false)
    setDragTarget(null)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const updated = { ...docFiles, [docId]: file }
    setDocFiles(updated)
    updateParent(updated, extraFiles)
  }

  const removeDocFile = (docId) => {
    const updated = { ...docFiles }
    delete updated[docId]
    setDocFiles(updated)
    updateParent(updated, extraFiles)
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].value = ''
    }
  }

  const handleExtraUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const updated = [...extraFiles, ...files]
    setExtraFiles(updated)
    updateParent(docFiles, updated)
  }

  const removeExtraFile = (idx) => {
    const updated = extraFiles.filter((_, i) => i !== idx)
    setExtraFiles(updated)
    updateParent(docFiles, updated)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px',
        fontSize: '18px',
        color: '#1A1A1A',
        fontFamily: "'Playfair Display', serif",
      }}>
        Documents requis
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {documents_requis.map((doc) => {
          const hasFile = !!docFiles[doc.id]
          return (
            <div
              key={doc.id}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); setDragTarget(doc.id) }}
              onDragLeave={() => { setIsDragging(false); setDragTarget(null) }}
              onDrop={(e) => handleDocDrop(doc.id, e)}
              style={{
                border: `1px solid ${dragTarget === doc.id ? '#C8A882' : hasFile ? '#A8D5A2' : '#E8DDD0'}`,
                borderRadius: '8px',
                padding: '14px 16px',
                background: dragTarget === doc.id ? '#FAF6F1' : hasFile ? '#F6FBF6' : 'white',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  {hasFile ? (
                    <CheckCircle size={18} color="#4CAF50" style={{ flexShrink: 0 }} />
                  ) : doc.required ? (
                    <AlertTriangle size={18} color="#E67E22" style={{ flexShrink: 0 }} />
                  ) : (
                    <Upload size={18} color="#9A8A7A" style={{ flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
                      {doc.label}
                      {doc.required && <span style={{ color: '#E53935', marginLeft: '4px' }}>*</span>}
                      {!doc.required && <span style={{ color: '#9A8A7A', marginLeft: '6px', fontWeight: 400, fontSize: '11px' }}>(optionnel)</span>}
                    </div>
                    {hasFile && (
                      <div style={{ fontSize: '11px', color: '#5A5A5A', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {docFiles[doc.id].name} - {formatSize(docFiles[doc.id].size)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {hasFile && (
                    <button
                      onClick={() => removeDocFile(doc.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9A8A7A',
                        padding: '4px',
                        display: 'flex',
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    style={{
                      background: hasFile ? '#FAF6F1' : '#C8A882',
                      color: hasFile ? '#6B4C2A' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {hasFile ? 'Changer' : 'Charger'}
                  </button>
                  <input
                    ref={(el) => fileInputRefs.current[doc.id] = el}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocUpload(doc.id, e)}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Extra files */}
      {extraFiles.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#5A5A5A', marginBottom: '8px' }}>
            Autres documents :
          </div>
          {extraFiles.map((file, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'white',
              borderRadius: '8px',
              marginBottom: '6px',
              border: '1px solid #E8DDD0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <FileText size={16} color="#C8A882" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9A8A7A' }}>
                    {formatSize(file.size)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeExtraFile(idx)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A', padding: '4px', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => extraFileRef.current?.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: '1px dashed #C8A882',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#C8A882',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Plus size={16} />
        Autre document
      </button>
      <input
        ref={extraFileRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleExtraUpload}
        style={{ display: 'none' }}
      />
    </div>
  )
}
