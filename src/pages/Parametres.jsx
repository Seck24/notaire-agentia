import { useState } from 'react'
import { Building2, Save, CheckCircle, Shield, Bell, Globe, Palette, Lock, Eye, EyeOff } from 'lucide-react'
import useAppStore from '../store/useAppStore'

export default function Parametres() {
  const { cabinetInfo, updateCabinetInfo } = useAppStore()
  const [form, setForm] = useState({
    nom: cabinetInfo.nom || '',
    adresse: cabinetInfo.adresse || '',
    numeroNotaire: cabinetInfo.numeroNotaire || '',
    ville: '',
    telephone: '',
    email: '',
  })
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    rappels: true,
  })
  const [preferences, setPreferences] = useState({
    langue: 'fr',
    format: 'A4',
    signature: true,
  })

  const handleSave = () => {
    updateCabinetInfo({
      nom: form.nom,
      adresse: form.adresse,
      numeroNotaire: form.numeroNotaire,
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

  const sectionStyle = {
    marginBottom: '24px',
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: '700px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A' }}>Paramètres</h1>
      <p style={{ margin: '0 0 32px', color: '#5A5A5A', fontSize: '14px' }}>
        Configurez votre cabinet et vos préférences
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
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>Données affichées sur vos actes</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ ...sectionStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nom du cabinet *</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Étude Notariale Dupont & Associés"
              style={inputStyle}
            />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>N° de notaire *</label>
            <input
              type="text"
              value={form.numeroNotaire}
              onChange={e => setForm({ ...form, numeroNotaire: e.target.value })}
              placeholder="NOT-2024-XXXX"
              style={inputStyle}
            />
          </div>
          <div style={sectionStyle}>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })}
              placeholder="+33 1 XX XX XX XX"
              style={inputStyle}
            />
          </div>
          <div style={{ ...sectionStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Adresse complète</label>
            <input
              type="text"
              value={form.adresse}
              onChange={e => setForm({ ...form, adresse: e.target.value })}
              placeholder="12 rue de la Paix, 75001 Paris"
              style={inputStyle}
            />
          </div>
          <div style={{ ...sectionStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email professionnel</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="contact@etude-dupont.fr"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
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
            <Palette size={18} color="#C8A882" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Préférences</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>Format et présentation des actes</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Format papier</div>
              <div style={{ fontSize: '12px', color: '#9A8A7A' }}>Format d'impression des actes</div>
            </div>
            <select
              value={preferences.format}
              onChange={e => setPreferences({ ...preferences, format: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8DDD0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1A1A1A',
                background: 'white',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div style={{ height: '1px', background: '#E8DDD0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Langue</div>
              <div style={{ fontSize: '12px', color: '#9A8A7A' }}>Langue de rédaction des actes</div>
            </div>
            <select
              value={preferences.langue}
              onChange={e => setPreferences({ ...preferences, langue: e.target.value })}
              style={{
                padding: '8px 12px',
                border: '1px solid #E8DDD0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1A1A1A',
                background: 'white',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
              }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div style={{ height: '1px', background: '#E8DDD0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Signature automatique</div>
              <div style={{ fontSize: '12px', color: '#9A8A7A' }}>Ajouter la signature du notaire en bas d'acte</div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, signature: !preferences.signature })}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: preferences.signature ? '#C8A882' : '#E8DDD0',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '3px',
                left: preferences.signature ? '23px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
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
            <Bell size={18} color="#C8A882" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Notifications</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>Alertes et rappels</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'email', label: 'Notifications par email', desc: 'Recevoir les résumés par email' },
            { key: 'sms', label: 'Notifications SMS', desc: 'Alertes urgentes par SMS' },
            { key: 'rappels', label: 'Rappels d\'échéances', desc: 'Rappels pour les actes en attente' },
          ].map(({ key, label, desc }, idx) => (
            <div key={key}>
              {idx > 0 && <div style={{ height: '1px', background: '#E8DDD0', marginBottom: '16px' }} />}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#9A8A7A' }}>{desc}</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: notifications[key] ? '#C8A882' : '#E8DDD0',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '3px',
                    left: notifications[key] ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
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
            <Shield size={18} color="#C8A882" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Sécurité</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>Mot de passe et accès</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Mot de passe actuel</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A8A7A' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type="password" placeholder="••••••••" style={inputStyle} />
          </div>
          <button className="btn-secondary" style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '8px 16px' }}>
            <Lock size={14} />
            Changer le mot de passe
          </button>
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
          Enregistrer les modifications
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '13px', fontWeight: 500 }}>
            <CheckCircle size={16} />
            Modifications enregistrées
          </div>
        )}
      </div>
    </div>
  )
}
