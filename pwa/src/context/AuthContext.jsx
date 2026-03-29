import { createContext, useContext, useState } from 'react'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [cabinet, setCabinet] = useState(() => {
    const s = localStorage.getItem('preo_cabinet')
    return s ? JSON.parse(s) : null
  })

  function login(data) {
    localStorage.setItem('preo_cabinet', JSON.stringify(data))
    setCabinet(data)
  }

  function logout() {
    localStorage.removeItem('preo_cabinet')
    setCabinet(null)
  }

  return (
    <AuthCtx.Provider value={{ cabinet, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
