/**
 * 认证Hook
 * 管理用户登录状态和认证相关操作
 */

import { useState, useEffect, ReactNode } from 'react'
import { authApi, User } from '../api/api'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 检查初始认证状态
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const response = await authApi.verify()
          if (response.success && response.data) {
            setIsAuthenticated(true)
            setUser(response.data.user)
          } else {
            localStorage.removeItem('auth_token')
          }
        } catch (error) {
          console.error('Auth verification failed:', error)
          localStorage.removeItem('auth_token')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password)
      if (response.success && response.data) {
        setIsAuthenticated(true)
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || '登录失败' }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请重试' }
    }
  }

  const logout = () => {
    authApi.logout()
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 需要导入React
import React