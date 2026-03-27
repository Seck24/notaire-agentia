import { useState } from 'react'
import { Clock, FileText, Filter, Download, Eye } from 'lucide-react'
import useAppStore from '../store/useAppStore'

const typeOptions = ['Tous les types', 'Acte de vente', 'Constitution de société', 'Succession', 'Donation', 'Bail notarié']
const periodOptions = ['Toutes les périodes', 'Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Cette année']

const sampleHistory = [
  {
    id: 1,
    type: 'Acte de vente',
    date: '15/03/2024',
    time: '14:32',
    client: 'Martin Dupont',
    ref: 'ACT-2024-001',
    status: 'Validé',
  },
  {
    id: 2,
    type: 'Constitution SARL',
    date: '10/03/2024',
    time: '09:15',
    client: 'TECH INNOV SARL',
    ref: 'ACT-2024-002',
    status: 'En attente',
  },
  {
    id: 3,
    type: 'Succession',
    date: '02/03/2024',
    time: '16:48',
    client: 'Famille Leblanc',
    ref: 'ACT-2024-003',
    status: 'Archivé',
  },
]

export default function Historique() {
  const [selectedType, setSelectedType] = useState('Tous les types')
  const [selectedPeriod, setSelectedPeriod] = useState('Toutes les périodes')
  const { dossiers } = useAppStore()

  const generatedHistory = dossiers.map(d => ({
    id: d.id,
    type: d.type,
    date: d.date,
    time: '--:--',
    client: 'Client',
    ref: `ACT-${d.id}`,
    status: 'Généré',
  }))

  const allHistory = [...sampleHistory, ...generatedHistory]

  const filtered = allHistory.filter(h => {
    const matchType = selectedType === 'Tous les types' || h.type === selectedType
    return matchType
  })

  const groupByDate = (items) => {
    const groups = {}
    items.forEach(item => {
      if (!groups[item.date]) groups[item.date] = []
      groups[item.date].push(item)
    })
    return groups
  }

  const grouped = groupByDate(filtered)

  return (
    <div style={{ padding: '32px 28px', maxWidth: '800px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '26px', color: '#1A1A1A' }}>Historique</h1>
      <p style={{ margin: '0 0 24px', color: '#5A5A5A', fontSize: '14px' }}>
        Tous vos actes générés et leur suivi
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="#9A8A7A" />
          <span style={{ fontSize: '13px', color: '#9A8A7A' }}>Filtres :</span>
        </div>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E8DDD0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1A1A1A',
            background: 'white',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {typeOptions.map(o => <option key={o}>{o}</option>)}
        </select>
        <select
          value={selectedPeriod}
          onChange={e => setSelectedPeriod(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #E8DDD0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1A1A1A',
            background: 'white',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {periodOptions.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '56px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FAF6F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Clock size={28} color="#C8A882" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1A1A1A' }}>Aucun acte dans l'historique</h3>
          <p style={{ margin: 0, color: '#5A5A5A', fontSize: '14px' }}>
            Vos actes générés apparaîtront ici
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} style={{ marginBottom: '28px' }}>
              {/* Date header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B4C2A',
                  background: '#FAF6F1',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #E8DDD0',
                }}>
                  {date}
                </div>
                <div style={{ flex: 1, height: '1px', background: '#E8DDD0' }} />
              </div>

              {/* Items */}
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '19px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  background: '#E8DDD0',
                }} />

                {items.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '12px',
                    position: 'relative',
                  }}>
                    {/* Timeline dot */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'white',
                      border: '2px solid #C8A882',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      <FileText size={16} color="#C8A882" />
                    </div>

                    {/* Card */}
                    <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', marginBottom: '4px' }}>
                            {item.type}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9A8A7A' }}>
                            {item.ref} · {item.client} · {item.time}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: item.status === 'Validé' ? '#E3F2FD' : item.status === 'Archivé' ? '#F5F5F5' : '#FAF6F1',
                            color: item.status === 'Validé' ? '#1565C0' : item.status === 'Archivé' ? '#616161' : '#6B4C2A',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            {item.status}
                          </span>
                          <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9A8A7A',
                            padding: '4px',
                            display: 'flex',
                          }}>
                            <Eye size={14} />
                          </button>
                          <button style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9A8A7A',
                            padding: '4px',
                            display: 'flex',
                          }}>
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
