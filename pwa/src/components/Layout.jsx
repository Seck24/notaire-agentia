import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
