'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiClient from '@/lib/axios'

type User = {
  id: number
  email: string
  name: string | null
  nickname: string | null
}

type AuthContextType = {
  currentUser: User | null
  isLoading: boolean
  isLoggedIn: boolean
  signUp: (email: string, password: string, passwordConfirmation: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const validateToken = useCallback(async () => {
    const accessToken = localStorage.getItem('access-token')
    const client = localStorage.getItem('client')
    const uid = localStorage.getItem('uid')

    if (!accessToken || !client || !uid) {
      setIsLoading(false)
      return
    }

    try {
      const response = await apiClient.get('/auth/validate_token')
      const userData = response.data.data
      setCurrentUser(userData)
      // uid がレスポンスヘッダーで欠損していた場合をボディから補完
      if (userData?.email) {
        localStorage.setItem('uid', userData.email)
      }
    } catch {
      localStorage.removeItem('access-token')
      localStorage.removeItem('client')
      localStorage.removeItem('uid')
      setCurrentUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  const signUp = async (
    email: string,
    password: string,
    passwordConfirmation: string,
    name: string
  ) => {
    try {
      const response = await apiClient.post('/auth', {
        email,
        password,
        password_confirmation: passwordConfirmation,
        name,
      })
      const userData = response.data.data
      setCurrentUser(userData)
      if (userData?.email) localStorage.setItem('uid', userData.email)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: string[] } } }
      const messages = axiosErr?.response?.data?.errors
      throw new Error(Array.isArray(messages) ? messages.join(' / ') : '登録に失敗しました')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/sign_in', { email, password })
      const userData = response.data.data
      setCurrentUser(userData)
      if (userData?.email) localStorage.setItem('uid', userData.email)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: string[] } } }
      const messages = axiosErr?.response?.data?.errors
      throw new Error(Array.isArray(messages) ? messages.join(' / ') : 'ログインに失敗しました')
    }
  }

  const signOut = async () => {
    try {
      await apiClient.delete('/auth/sign_out')
    } catch {
      // サーバーエラーでもローカルは必ずクリア
    } finally {
      localStorage.removeItem('access-token')
      localStorage.removeItem('client')
      localStorage.removeItem('uid')
      setCurrentUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isLoggedIn: currentUser !== null,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
