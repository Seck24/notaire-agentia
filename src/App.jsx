import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import NouvelActe from './pages/NouvelActe'
import Parametres from './pages/Parametres'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0EB' }}>
        {/* Sidebar - desktop only */}
        <div style={{ display: 'none' }} className="sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Sidebar visible md+ */}
        <div style={{}} id="desktop-sidebar">
          <Sidebar />
        </div>

        {/* Main content */}
        <main style={{
          flex: 1,
          marginLeft: '260px',
          paddingBottom: '80px',
          minHeight: '100vh',
        }} id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nouvel-acte" element={<NouvelActe />} />
            <Route path="/parametres" element={<Parametres />} />
          </Routes>
        </main>

        {/* Bottom nav - mobile only */}
        <div id="mobile-nav">
          <BottomNav />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #desktop-sidebar { display: none !important; }
          #main-content { margin-left: 0 !important; padding-bottom: 80px !important; }
          #mobile-nav { display: block; }
        }
        @media (min-width: 769px) {
          #desktop-sidebar { display: block; }
          #mobile-nav { display: none; }
          #main-content { margin-left: 260px; }
        }
      `}</style>
    </BrowserRouter>
  )
}
