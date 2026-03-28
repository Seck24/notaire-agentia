import { useState, useRef } from 'react'
import { Building2, Save, CheckCircle, Upload, X } from 'lucide-react'
import useAppStore from '../store/useAppStore'

export default function Parametres() {
  const { cabinetInfo, updateCabinetInfo } = useAppStore()
  const [form, setForm] = useState({
    nom: cabinetInfo.nom || '',
    utilisateur: cabinetInfo.utilisateur || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(cabinetInfo.logo || null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = () => {
    updateCabinetInfo({
      nom: form.nom,
      utilisateur: form.utilisateur,
      logo: logoPreview,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

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

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '6px',
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: '700px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A' }}>Parametres</h1>
      <p style={{ margin: '0 0 32px', color: '#5A5A5A', fontSize: '14px' }}>
        Configurez votre cabinet
      </p>

      {/* Cabinet info */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#FAF6F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={18} color="#C8A882" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Informations du cabinet</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>Donnees affichees sur vos actes</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Nom du cabinet */}
          <div>
            <label style={labelStyle}>Nom du cabinet</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Etude Notariale Dupont & Associes"
              style={inputStyle}
            />
          </div>

          {/* Logo */}
          <div>
            <label style={labelStyle}>Logo du cabinet</label>
            {logoPreview ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                border: '1px solid #E8DDD0',
                borderRadius: '8px',
                background: '#FAF6F1',
              }}>
                <img
                  src={logoPreview}
                  alt="Logo"
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    background: 'white',
                  }}
                />
                <div style={{ flex: 1, fontSize: '13px', color: '#6B4C2A', fontWeight: 500 }}>
                  {logoFile ? logoFile.name : 'Logo charge'}
                </div>
                <button
                  onClick={removeLogo}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9A8A7A',
                    padding: '4px',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  border: '1px dashed #E8DDD0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#5A5A5A',
                  fontFamily: "'Inter', sans-serif",
                  width: '100%',
                }}
              >
                <Upload size={16} color="#C8A882" />
                Charger un logo (PNG, JPG)
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Nom utilisateur */}
          <div>
            <label style={labelStyle}>Nom de l'utilisateur</label>
            <input
              type="text"
              value={form.utilisateur}
              onChange={e => setForm({ ...form, utilisateur: e.target.value })}
              placeholder="Me Jean Dupont"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
        >
          <Save size={16} />
          Enregistrer
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '13px', fontWeight: 500 }}>
            <CheckCircle size={16} />
            Enregistre
          </div>
        )}
      </div>
    </div>
  )
}
