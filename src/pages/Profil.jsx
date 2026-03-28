import { useState } from 'react'
import { Building2, CheckCircle, Copy, LogOut, Clock, FileText, Crown, Loader2, Save } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useAppStore from '../store/useAppStore'
import { supabase } from '../lib/supabase'

export default function Profil() {
  const navigate = useNavigate()
  const { profil, joursRestants, logout } = useAuthStore()
  const { stats } = useAppStore()
  const [editMode, setEditMode] = useState(false)
  const [nomEdit, setNomEdit] = useState(profil?.nom_cabinet || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const handleSaveNom = async () => {
    setSaving(true)
    try {
      await supabase
        .from('profils_cabinets')
        .update({ nom_cabinet: nomEdit })
        .eq('user_id', profil.user_id)
      useAuthStore.getState().chargerProfil(profil.user_id)
      setEditMode(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const copyToken = () => {
    if (profil?.token_api) {
      navigator.clipboard.writeText(profil.token_api)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const maskedToken = profil?.token_api
    ? profil.token_api.slice(0, 8) + '****************************'
    : '—'

  const statutCompte = profil?.statut_compte || 'essai'
  const joursEcoules = 14 - (joursRestants || 0)
  const progressPercent = Math.min(100, (joursEcoules / 14) * 100)

  const getBannerColor = () => {
    if (joursRestants > 7) return '#2E7D32'
    if (joursRestants >= 4) return '#E65100'
    return '#C62828'
  }

  const dateExpiration = profil?.date_essai_fin
    ? new Date(profil.date_essai_fin).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

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
    boxSizing: 'border-box',
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
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
        Profil
      </h1>
      <p style={{ margin: '0 0 32px', color: '#5A5A5A', fontSize: '14px' }}>
        Gerez votre cabinet et votre abonnement
      </p>

      {/* CABINET HEADER */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={18} color="#C8A882" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Mon cabinet</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9A8A7A' }}>{profil?.email_contact}</p>
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: '6px 14px', border: '1px solid #E8DDD0', borderRadius: '6px',
                background: 'white', cursor: 'pointer', fontSize: '12px', color: '#6B4C2A',
                fontFamily: "'Inter', sans-serif", fontWeight: 600,
              }}
            >
              Modifier
            </button>
          )}
        </div>

        {editMode ? (
          <div>
            <label style={labelStyle}>Nom du cabinet</label>
            <input
              type="text"
              value={nomEdit}
              onChange={(e) => setNomEdit(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="btn-primary"
                onClick={handleSaveNom}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
              >
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                Enregistrer
              </button>
              <button
                onClick={() => { setEditMode(false); setNomEdit(profil?.nom_cabinet || '') }}
                style={{
                  padding: '8px 16px', border: '1px solid #E8DDD0', borderRadius: '8px',
                  background: 'white', cursor: 'pointer', fontSize: '13px', color: '#5A5A5A',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
              {profil?.nom_cabinet || '—'}
            </div>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '12px', marginTop: '8px' }}>
                <CheckCircle size={14} /> Enregistre
              </div>
            )}
          </div>
        )}
      </div>

      {/* STATUT ABONNEMENT */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={18} color="#C8A882" />
          </div>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#1A1A1A' }}>Statut abonnement</h2>
        </div>

        {statutCompte === 'essai' && (
          <div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              background: getBannerColor() + '18', color: getBannerColor(),
              fontSize: '12px', fontWeight: 600, marginBottom: '16px',
            }}>
              Essai gratuit
            </div>

            <div style={{
              background: '#F5F0EB', borderRadius: '6px', height: '8px',
              overflow: 'hidden', marginBottom: '8px',
            }}>
              <div style={{
                height: '100%',
                background: getBannerColor(),
                borderRadius: '6px',
                width: `${progressPercent}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: getBannerColor() }}>
                {joursRestants} jour{joursRestants !== 1 ? 's' : ''} restant{joursRestants !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '12px', color: '#9A8A7A' }}>
                Expire le {dateExpiration}
              </span>
            </div>

            <Link
              to="/expiration"
              style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
                background: '#C8A882', color: 'white', textDecoration: 'none',
                fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
              }}
            >
              Passer au plan Pro
            </Link>
          </div>
        )}

        {statutCompte === 'actif' && (
          <div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              background: '#E8F5E9', color: '#2E7D32',
              fontSize: '12px', fontWeight: 600, marginBottom: '8px',
            }}>
              Abonnement actif
            </div>
            <div style={{ fontSize: '14px', color: '#5A5A5A', marginTop: '8px' }}>
              Plan : <strong style={{ color: '#1A1A1A' }}>{profil?.plan || '—'}</strong>
            </div>
          </div>
        )}

        {(statutCompte === 'expire' || statutCompte === 'suspendu') && (
          <div>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              background: '#FFEBEE', color: '#C62828',
              fontSize: '12px', fontWeight: 600, marginBottom: '12px',
            }}>
              Essai expire
            </div>
            <div style={{ marginTop: '8px' }}>
              <Link
                to="/expiration"
                style={{
                  display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
                  background: '#C8A882', color: 'white', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                }}
              >
                Choisir un plan
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* UTILISATION */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1A1A1A' }}>Utilisation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{
            padding: '16px', background: '#FAF6F1', borderRadius: '8px', textAlign: 'center',
          }}>
            <FileText size={20} color="#C8A882" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
              {stats.actes_generes}
            </div>
            <div style={{ fontSize: '12px', color: '#9A8A7A', marginTop: '4px' }}>Actes generes</div>
          </div>
          <div style={{
            padding: '16px', background: '#FAF6F1', borderRadius: '8px', textAlign: 'center',
          }}>
            <Clock size={20} color="#6B4C2A" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
              ~{stats.temps_economise}h
            </div>
            <div style={{ fontSize: '12px', color: '#9A8A7A', marginTop: '4px' }}>Temps economise</div>
          </div>
        </div>
      </div>

      {/* TOKEN API */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1A1A1A' }}>Mon token API</h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px', background: '#FAF6F1', borderRadius: '8px',
          border: '1px solid #E8DDD0',
        }}>
          <code style={{
            flex: 1, fontSize: '13px', color: '#6B4C2A',
            fontFamily: 'monospace', wordBreak: 'break-all',
          }}>
            {showToken ? (profil?.token_api || '—') : maskedToken}
          </code>
          <button
            onClick={() => setShowToken(!showToken)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9A8A7A', fontSize: '11px', fontFamily: "'Inter', sans-serif",
              padding: '4px 8px',
            }}
          >
            {showToken ? 'Masquer' : 'Voir'}
          </button>
          <button
            onClick={copyToken}
            style={{
              background: 'none', border: '1px solid #E8DDD0', borderRadius: '6px',
              cursor: 'pointer', padding: '6px 10px', display: 'flex',
              alignItems: 'center', gap: '4px', fontSize: '12px',
              color: copied ? '#2E7D32' : '#6B4C2A', fontFamily: "'Inter', sans-serif",
            }}
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? 'Copie' : 'Copier'}
          </button>
        </div>
      </div>

      {/* DECONNEXION */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', padding: '14px', border: '1px solid #EF9A9A',
          borderRadius: '8px', background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', fontSize: '14px', color: '#C62828',
          fontFamily: "'Inter', sans-serif", fontWeight: 600,
        }}
      >
        <LogOut size={16} />
        Se deconnecter
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
