import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { verifierToken } from '../services/api'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token.trim()) return
    setError('')
    setLoading(true)
    try {
      const data = await verifierToken(token.trim())
      login({ ...data, token: token.trim() })
      navigate('/dashboard')
    } catch {
      setError('Token invalide ou cabinet inactif')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', width: 380 }}>
        {/* Logo */}
        <div className="font-display" style={{ fontSize: 52, color: 'var(--gold)', fontWeight: 300, lineHeight: 1 }}>
          Preo IA
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, marginBottom: 40 }}>
          Plateforme Notariale IA
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--surface)',
          border: '1px solid var(--gold-border)',
          borderRadius: 16,
          padding: 40,
        }}>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              className="input-dark"
              placeholder="Token d'acces cabinet"
              value={token}
              onChange={e => setToken(e.target.value)}
              style={{ textAlign: 'center', fontSize: 14 }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            disabled={loading || !token.trim()}
            style={{ width: '100%', padding: '12px 20px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin-slow" /> : null}
            {loading ? 'Verification...' : 'Acceder a l\'etude'}
          </button>

          {error && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--red)' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
