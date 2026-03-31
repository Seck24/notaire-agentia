import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, BookOpen, AlertTriangle } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { poserConseil } from '../api'

const API_URL = import.meta.env.VITE_API_URL || ''

const SUGGESTIONS = [
  "Quelles sont les conditions pour vendre un terrain sous ACD en Côte d'Ivoire ?",
  "Quel est le capital minimum pour constituer une SARL selon l'OHADA ?",
  "Comment se calcule la quotité disponible en droit successoral ivoirien ?",
  "Quelles taxes s'appliquent lors d'une vente immobilière en CI ?",
]

export default function Conseil() {
  const { profil } = useAuthStore()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (q) => {
    const text = (q || question).trim()
    if (!text || loading) return

    if (!API_URL) {
      setErreur("Le mode Conseil nécessite la configuration du backend. Contactez votre administrateur.")
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setQuestion('')
    setLoading(true)
    setErreur(null)

    try {
      const data = await poserConseil({ question: text, cabinet_id: profil?.cabinet_id || 'commun' })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reponse }])
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la consultation. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: '800px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6B4C2A 0%, #C8A882 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1A1A1A', fontFamily: "'Playfair Display', serif" }}>
            Mode Conseil
          </h1>
        </div>
        <p style={{ margin: 0, color: '#5A5A5A', fontSize: '14px', paddingLeft: '52px' }}>
          Questions juridiques — droit notarial ivoirien et OHADA
        </p>
      </div>

      {!API_URL && (
        <div style={{
          background: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: '8px',
          padding: '14px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
        }}>
          <AlertTriangle size={16} color="#E65100" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '13px', color: '#BF360C' }}>
            Le backend API n'est pas encore configuré. Cette fonctionnalité sera disponible après la mise à jour DNS.
          </p>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', marginBottom: '20px',
        minHeight: messages.length === 0 ? 'auto' : '200px',
      }}>
        {messages.length === 0 && (
          <div>
            <p style={{ fontSize: '14px', color: '#9A8A7A', marginBottom: '16px' }}>
              Posez une question sur le droit notarial ivoirien ou OHADA :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  disabled={!API_URL}
                  style={{
                    textAlign: 'left', padding: '12px 16px',
                    background: 'white', border: '1px solid #E8DDD0', borderRadius: '8px',
                    fontSize: '13px', color: API_URL ? '#6B4C2A' : '#9A8A7A',
                    cursor: API_URL ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif",
                    transition: 'border-color 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '16px',
          }}>
            <div style={{
              maxWidth: '85%', padding: '14px 18px', borderRadius: '12px',
              background: msg.role === 'user' ? '#6B4C2A' : 'white',
              color: msg.role === 'user' ? 'white' : '#1A1A1A',
              border: msg.role === 'assistant' ? '1px solid #E8DDD0' : 'none',
              fontSize: '14px', lineHeight: 1.6,
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#9A8A7A', fontSize: '13px' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Consultation en cours...
          </div>
        )}

        {erreur && (
          <div style={{
            background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: '8px',
            padding: '12px 16px', fontSize: '13px', color: '#B71C1C', marginTop: '8px',
          }}>
            {erreur}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '10px', alignItems: 'flex-end',
        padding: '16px', background: 'white', borderRadius: '12px',
        border: '1px solid #E8DDD0',
      }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Posez votre question juridique..."
          rows={2}
          disabled={!API_URL || loading}
          style={{
            flex: 1, border: 'none', outline: 'none', resize: 'none',
            fontSize: '14px', fontFamily: "'Inter', sans-serif",
            color: '#1A1A1A', background: 'transparent',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!question.trim() || loading || !API_URL}
          style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: question.trim() && !loading && API_URL ? '#6B4C2A' : '#E8DDD0',
            border: 'none', cursor: question.trim() && !loading && API_URL ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          {loading
            ? <Loader2 size={16} color="white" style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={16} color={question.trim() && !loading && API_URL ? 'white' : '#9A8A7A'} />
          }
        </button>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#9A8A7A', textAlign: 'center' }}>
        Les réponses sont indicatives. Seul le notaire peut valider un acte juridique.
      </p>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
