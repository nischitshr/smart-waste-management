import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'

interface User {
  id: number
  username: string
  email: string
  role: 'citizen' | 'driver' | 'admin'
  phone: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}



const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/users/profile/')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.post('/users/login/', { username, password })
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    const profile = await api.get('/users/profile/')
    setUser(profile.data)
  }

  const register = async (data: { username: string; email: string; password: string; phone?: string }) => {
    await api.post('/users/register/', { ...data, role: 'citizen' })
    await login(data.username, data.password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
  
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

