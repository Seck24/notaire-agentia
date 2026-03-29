import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NouvelActe from './pages/NouvelActe'
import Conseil from './pages/Conseil'

function PrivateRoute({ children }) {
  const { cabinet } = useAuth()
  return cabinet ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/nouvel-acte" element={<PrivateRoute><NouvelActe /></PrivateRoute>} />
          <Route path="/conseil" element={<PrivateRoute><Conseil /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
