import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { SCHEMAS } from '../schemas/actes'

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid #E8DDD0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1A1A1A',
  background: 'white',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  transition: 'border-color 0.15s',
}

const inputErrorStyle = {
  ...inputStyle,
  borderColor: '#E67E22',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#1A1A1A',
  marginBottom: '6px',
}

function FieldRenderer({ field, value, onChange, showErrors }) {
  const hasError = showErrors && field.required && !value
  const style = hasError ? inputErrorStyle : inputStyle

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>
        {field.label}
        {field.required && <span style={{ color: '#E53935', marginLeft: '4px' }}>*</span>}
      </label>
      {field.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
          style={style}
        />
      )}
      {field.type === 'number' && (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
          style={style}
        />
      )}
      {field.type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}
      {field.type === 'select' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...style,
            cursor: 'pointer',
          }}
        >
          <option value="">-- Choisir --</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {field.type === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
          rows={3}
          style={{
            ...style,
            resize: 'vertical',
          }}
        />
      )}
      {hasError && (
        <div style={{ fontSize: '11px', color: '#E67E22', marginTop: '4px', fontWeight: 500 }}>
          Champ requis
        </div>
      )}
    </div>
  )
}

export default function FormulaireActe({ typeActe, initialData = {}, onChange, showErrors = false }) {
  const schema = SCHEMAS[typeActe]
  const [formData, setFormData] = useState(initialData)
  const [collapsedSections, setCollapsedSections] = useState({})

  useEffect(() => {
    if (!schema) return
    const init = { ...initialData }
    schema.sections.forEach((section) => {
      if (section.repetable && !init[section.id]) {
        const emptyEntry = {}
        section.fields.forEach((f) => { emptyEntry[f.id] = '' })
        init[section.id] = [emptyEntry]
      } else if (!section.repetable && !init[section.id]) {
        init[section.id] = {}
        section.fields.forEach((f) => { init[section.id][f.id] = '' })
      }
    })
    setFormData(init)
  }, [typeActe])

  useEffect(() => {
    if (onChange) onChange(formData)
  }, [formData])

  if (!schema) return null

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const updateField = (sectionId, fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value,
      },
    }))
  }

  const updateRepeatableField = (sectionId, index, fieldId, value) => {
    setFormData((prev) => {
      const arr = [...(prev[sectionId] || [])]
      arr[index] = { ...(arr[index] || {}), [fieldId]: value }
      return { ...prev, [sectionId]: arr }
    })
  }

  const addRepeatableEntry = (section) => {
    const emptyEntry = {}
    section.fields.forEach((f) => { emptyEntry[f.id] = '' })
    setFormData((prev) => ({
      ...prev,
      [section.id]: [...(prev[section.id] || []), emptyEntry],
    }))
  }

  const removeRepeatableEntry = (sectionId, index, min) => {
    setFormData((prev) => {
      const arr = prev[sectionId] || []
      if (arr.length <= (min || 1)) return prev
      return { ...prev, [sectionId]: arr.filter((_, i) => i !== index) }
    })
  }

  return (
    <div>
      <h3 style={{
        margin: '0 0 16px',
        fontSize: '18px',
        color: '#1A1A1A',
        fontFamily: "'Playfair Display', serif",
      }}>
        Informations de l'acte
      </h3>

      {schema.sections.map((section) => {
        const isCollapsed = collapsedSections[section.id]

        return (
          <div
            key={section.id}
            className="card"
            style={{
              marginBottom: '16px',
              overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FAF6F1',
                border: 'none',
                borderBottom: isCollapsed ? 'none' : '1px solid #E8DDD0',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#6B4C2A',
                fontFamily: "'Playfair Display', serif",
              }}>
                {section.label}
              </span>
              {isCollapsed ? <ChevronDown size={18} color="#6B4C2A" /> : <ChevronUp size={18} color="#6B4C2A" />}
            </button>

            {/* Section body */}
            {!isCollapsed && (
              <div style={{ padding: '20px' }}>
                {section.repetable ? (
                  <>
                    {(formData[section.id] || []).map((entry, idx) => (
                      <div key={idx} style={{
                        marginBottom: '16px',
                        paddingBottom: '16px',
                        borderBottom: idx < (formData[section.id] || []).length - 1 ? '1px solid #E8DDD0' : 'none',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '12px',
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#5A5A5A' }}>
                            {section.label} #{idx + 1}
                          </span>
                          {(formData[section.id] || []).length > (section.min || 1) && (
                            <button
                              onClick={() => removeRepeatableEntry(section.id, idx, section.min)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                color: '#E53935',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              <Trash2 size={13} />
                              Supprimer
                            </button>
                          )}
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                          gap: '0 16px',
                        }}>
                          {section.fields.map((field) => (
                            <FieldRenderer
                              key={field.id}
                              field={field}
                              value={entry[field.id]}
                              onChange={(val) => updateRepeatableField(section.id, idx, field.id, val)}
                              showErrors={showErrors}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addRepeatableEntry(section)}
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
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={16} />
                      {section.repetable_label || 'Ajouter'}
                    </button>
                  </>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '0 16px',
                  }}>
                    {section.fields.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        value={(formData[section.id] || {})[field.id]}
                        onChange={(val) => updateField(section.id, field.id, val)}
                        showErrors={showErrors}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
