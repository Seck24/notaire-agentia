import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scale, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const villes = ['Abidjan', 'Bouake', 'Yamoussoukro', 'San Pedro', 'Autre']

export default function Inscription() {
  const navigate = useNavigate()
  const { inscrire } = useAuthStore()
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    nom_cabinet: '',
    email: '',
    telephone: '',
    ville: '',
    password: '',
    confirmPassword: '',
  })

  const update = (field, value) => setForm({ ...form, [field]: value })

  const goStep2 = () => {
    setError(null)
    if (!form.nom_cabinet.trim()) {
      setError('Le nom du cabinet est requis')
      return
    }
    if (!form.email.trim()) {
      setError("L'email est requis")
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await inscrire({
        nom_cabinet: form.nom_cabinet,
        email: form.email,
        telephone: form.telephone,
        ville: form.ville,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E8DDD0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1A1A1A',
    background: 'white',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s',
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
    <div style={{
      minHeight: '100vh',
      background: '#F5F0EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #6B4C2A 0%, #C8A882 100%)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Scale size={28} color="white" />
          </div>
          <h1 style={{
            margin: '0 0 4px',
            fontSize: '28px',
            color: '#6B4C2A',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
          }}>
            NotaireAgent IA
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#9A8A7A' }}>
            Creez votre compte en 2 etapes
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: '#C8A882',
          }} />
          <div style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: step >= 2 ? '#C8A882' : '#E8DDD0',
            transition: 'background 0.3s',
          }} />
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              background: '#FFEBEE',
              border: '1px solid #EF9A9A',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#B71C1C',
            }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                color: '#1A1A1A',
                fontFamily: "'Playfair Display', serif",
              }}>
                Informations du cabinet
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Nom du cabinet *</label>
                  <input
                    type="text"
                    value={form.nom_cabinet}
                    onChange={(e) => update('nom_cabinet', e.target.value)}
                    placeholder="Etude Notariale Kouame & Associes"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="contact@cabinet.ci"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Telephone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => update('telephone', e.target.value)}
                    placeholder="+225 07 XX XX XX XX"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Ville</label>
                  <select
                    value={villes.includes(form.ville) ? form.ville : form.ville ? 'Autre' : ''}
                    onChange={(e) => {
                      if (e.target.value === 'Autre') {
                        update('ville', '')
                        update('villeAutre', true)
                      } else {
                        update('ville', e.target.value)
                        update('villeAutre', false)
                      }
                    }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Selectionnez une ville</option>
                    {villes.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {(form.villeAutre || (!villes.includes(form.ville) && form.ville)) && (
                    <input
                      type="text"
                      value={villes.includes(form.ville) ? '' : form.ville}
                      onChange={(e) => update('ville', e.target.value)}
                      placeholder="Nom de votre ville"
                      style={{ ...inputStyle, marginTop: '8px' }}
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={goStep2}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  padding: '13px',
                }}
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '18px',
                color: '#1A1A1A',
                fontFamily: "'Playfair Display', serif",
              }}>
                Mot de passe
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Minimum 8 caracteres"
                      required
                      style={{ ...inputStyle, paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9A8A7A',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirmer le mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      placeholder="Confirmez votre mot de passe"
                      required
                      style={{ ...inputStyle, paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9A8A7A',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null) }}
                  style={{
                    padding: '13px 20px',
                    border: '1px solid #E8DDD0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    color: '#5A5A5A',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '15px',
                    padding: '13px',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  Creer mon compte
                </button>
              </div>

              <p style={{
                textAlign: 'center',
                marginTop: '12px',
                fontSize: '12px',
                color: '#9A8A7A',
              }}>
                Essai gratuit 14 jours
              </p>
            </form>
          )}

          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '14px',
            color: '#5A5A5A',
          }}>
            Deja un compte ?{' '}
            <Link to="/login" style={{ color: '#C8A882', fontWeight: 600, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: '#9A8A7A',
        }}>
          Propulse par Preo-IA
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
