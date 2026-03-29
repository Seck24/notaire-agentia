import { useState, useRef, useEffect } from 'react'
import { Scale, Send, RotateCcw, AlertTriangle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { envoyerConseil } from '../services/api'

const SUGGESTIONS = [
  'Comparer indivision et SCI pour un achat a deux non maries',
  'Calculer les frais d\'une vente immobiliere a 50 000 000 FCFA',
  'Quels sont les droits de succession entre epoux en Cote d\'Ivoire ?',
  'Un ressortissant etranger peut-il acheter un bien en CI ?',
  'Difference entre SARL et SAS en droit OHADA',
]

export default function Conseil() {
  const { cabinet } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend(question) {
    const q = (question || input).trim()
    if (!q || loading) return

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await envoyerConseil({
        question: q,
        cabinet_id: cabinet?.cabinet_id || cabinet?.token,
      })
      const assistantMsg = {
        role: 'assistant',
        content: data.reponse || data.response || 'Aucune reponse recue.',
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Erreur : ${err.message}. Veuillez reessayer.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setMessages([])
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showSuggestions = messages.length === 0

  return (
    <Layout>
      <div className="animate-fade-in" style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 780 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Scale size={20} color="var(--gold)" strokeWidth={1.5} />
            <h1 className="font-display" style={{ fontSize: 24, fontWeight: 300, margin: 0 }}>
              Mode Conseil Juridique
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Posez vos questions de droit notarial ivoirien
          </p>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Suggestions rapides</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="conseil-suggestion"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat zone */}
        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 16,
            minHeight: 0,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div className={`conseil-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.role === 'assistant' && (
                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    fontSize: 11,
                    color: '#e0a030',
                  }}>
                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                    A valider par {cabinet?.nom_cabinet || 'le notaire'} avant toute communication client
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="conseil-bubble assistant">
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="skeleton" style={{ width: 200, height: 14 }} />
                </div>
                <div className="skeleton" style={{ width: 260, height: 14, marginTop: 6 }} />
                <div className="skeleton" style={{ width: 140, height: 14, marginTop: 6 }} />
              </div>
            </div>
          )}
        </div>

        {/* Input zone */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {messages.length > 0 && (
            <button
              className="btn-ghost"
              onClick={handleReset}
              title="Nouvelle question"
              style={{ padding: '10px 12px', flexShrink: 0 }}
            >
              <RotateCcw size={16} />
            </button>
          )}
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              className="input-dark"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              rows={1}
              style={{ resize: 'none', minHeight: 42, paddingRight: 48 }}
            />
            <button
              className="btn-gold"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{
                position: 'absolute',
                right: 4,
                bottom: 4,
                padding: '8px 10px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
