import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import BandeauEssai from './components/BandeauEssai'
import Home from './pages/Home'
import NouvelActe from './pages/NouvelActe'
import Profil from './pages/Profil'
import Login from './pages/Login'
import Inscription from './pages/Inscription'
import Expiration from './pages/Expiration'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0EB' }}>
        {/* Sidebar - desktop only */}
        <div id="desktop-sidebar">
          <Sidebar />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} id="main-content">
          <BandeauEssai />
          <main style={{ flex: 1, paddingBottom: '80px' }}>
            {children}
          </main>
        </div>

        {/* Bottom nav - mobile only */}
        <div id="mobile-nav">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/expiration" element={<Expiration />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
        <Route path="/nouvel-acte" element={<ProtectedLayout><NouvelActe /></ProtectedLayout>} />
        <Route path="/profil" element={<ProtectedLayout><Profil /></ProtectedLayout>} />
        <Route path="/parametres" element={<Navigate to="/profil" replace />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <style>{`
        @media (max-width: 768px) {
          #desktop-sidebar { display: none !important; }
          #main-content { margin-left: 0 !important; }
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
