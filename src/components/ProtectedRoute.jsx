import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ children }) {
  const { session, profil, loading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#F5F0EB',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color="#C8A882" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: '#9A8A7A', fontSize: '14px' }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profil && (profil.statut_compte === 'expire' || profil.statut_compte === 'suspendu')) {
    return <Navigate to="/expiration" replace />
  }

  return children
}
