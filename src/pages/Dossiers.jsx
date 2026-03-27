import { useState } from 'react'
import { Search, FolderOpen, Plus, FileText, Clock, CheckCircle, Archive, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

const sampleDossiers = [
  {
    id: 1,
    type: 'Acte de vente',
    client: 'Martin Dupont',
    date: '15/03/2024',
    status: 'En cours',
    ref: 'DOS-2024-001',
    desc: 'Vente appartement 75 m² — Paris 16e',
  },
  {
    id: 2,
    type: 'Constitution de société',
    client: 'Société TECH INNOV',
    date: '10/03/2024',
    status: 'Validé',
    ref: 'DOS-2024-002',
    desc: 'Création SARL capital 10 000€',
  },
  {
    id: 3,
    type: 'Succession',
    client: 'Famille Leblanc',
    date: '02/03/2024',
    status: 'Archivé',
    ref: 'DOS-2024-003',
    desc: 'Partage successoral — 3 héritiers',
  },
]

const statusConfig = {
  'En cours': { color: '#1B5E20', bg: '#E8F5E9', icon: Clock },
  'Validé': { color: '#1565C0', bg: '#E3F2FD', icon: CheckCircle },
  'Archivé': { color: '#616161', bg: '#F5F5F5', icon: Archive },
  'Généré': { color: '#6B4C2A', bg: '#FAF6F1', icon: FileText },
}

const tabs = ['Tous', 'En cours', 'Validés', 'Archivés']

export default function Dossiers() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Tous')
  const navigate = useNavigate()
  const { dossiers } = useAppStore()

  const allDossiers = [...sampleDossiers, ...dossiers.map(d => ({
    ...d,
    client: 'Client',
    ref: `DOS-${d.id}`,
    desc: d.type,
  }))]

  const filtered = allDossiers.filter(d => {
    const matchSearch = !search ||
      d.type?.toLowerCase().includes(search.toLowerCase()) ||
      d.client?.toLowerCase().includes(search.toLowerCase()) ||
      d.ref?.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeTab === 'Tous' ||
      (activeTab === 'En cours' && d.status === 'En cours') ||
      (activeTab === 'Validés' && d.status === 'Validé') ||
      (activeTab === 'Archivés' && d.status === 'Archivé')
    return matchSearch && matchTab
  })

  return (
    <div style={{ padding: '32px 28px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#1A1A1A' }}>Dossiers</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/nouvel-acte')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 18px' }}
        >
          <Plus size={16} />
          Nouveau dossier
        </button>
      </div>
      <p style={{ margin: '0 0 24px', color: '#5A5A5A', fontSize: '14px' }}>
        {allDossiers.length} dossier{allDossiers.length > 1 ? 's' : ''} au total
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} color="#9A8A7A" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Rechercher un dossier, client, référence..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            border: '1px solid #E8DDD0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
            color: '#1A1A1A',
            background: 'white',
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #E8DDD0', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab ? '#C8A882' : 'transparent',
              color: activeTab === tab ? 'white' : '#5A5A5A',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dossiers list */}
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
            <FolderOpen size={28} color="#C8A882" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1A1A1A' }}>Aucun dossier trouvé</h3>
          <p style={{ margin: '0 0 20px', color: '#5A5A5A', fontSize: '14px' }}>
            {search ? 'Modifiez votre recherche ou' : 'Commencez par'} créer un nouveau dossier
          </p>
          <button className="btn-primary" onClick={() => navigate('/nouvel-acte')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            Nouveau dossier
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((d) => {
            const statusConf = statusConfig[d.status] || statusConfig['Généré']
            const StatusIcon = statusConf.icon
            return (
              <div key={d.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#FAF6F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FileText size={16} color="#C8A882" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{d.type}</div>
                        <div style={{ fontSize: '12px', color: '#9A8A7A' }}>{d.ref}</div>
                      </div>
                    </div>
                    <div style={{ paddingLeft: '46px' }}>
                      <div style={{ fontSize: '13px', color: '#5A5A5A', marginBottom: '4px' }}>{d.desc}</div>
                      <div style={{ fontSize: '12px', color: '#9A8A7A' }}>
                        Client : <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{d.client}</span>
                        {' · '}
                        {d.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: statusConf.bg,
                      color: statusConf.color,
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <StatusIcon size={11} />
                      {d.status}
                    </span>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: '1px solid #E8DDD0',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      color: '#5A5A5A',
                      cursor: 'pointer',
                    }}>
                      <Eye size={12} />
                      Voir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
