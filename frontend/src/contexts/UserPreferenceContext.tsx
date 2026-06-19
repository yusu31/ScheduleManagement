'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type IconPreference = {
  emoji: string
  color: string
}

type UserPreferenceContextType = {
  iconPref: IconPreference
  setIconPref: (pref: IconPreference) => void
}

const DEFAULT_PREF: IconPreference = {
  emoji: '',
  color: '#5F8B8B',
}

const UserPreferenceContext = createContext<UserPreferenceContextType | undefined>(undefined)

export function UserPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [iconPref, setIconPrefState] = useState<IconPreference>(DEFAULT_PREF)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user-icon-pref')
      if (saved) setIconPrefState(JSON.parse(saved))
    } catch {
      // 読み込み失敗時はデフォルト値を使用
    }
  }, [])

  const setIconPref = (pref: IconPreference) => {
    setIconPrefState(pref)
    localStorage.setItem('user-icon-pref', JSON.stringify(pref))
  }

  return (
    <UserPreferenceContext.Provider value={{ iconPref, setIconPref }}>
      {children}
    </UserPreferenceContext.Provider>
  )
}

export function useUserPreference() {
  const context = useContext(UserPreferenceContext)
  if (context === undefined) {
    throw new Error('useUserPreference must be used within a UserPreferenceProvider')
  }
  return context
}

export const ICON_COLORS = [
  { label: 'ティール',    value: '#5F8B8B' },
  { label: 'オレンジ',   value: '#E67E22' },
  { label: 'レッド',     value: '#E74C3C' },
  { label: 'パープル',   value: '#9B59B6' },
  { label: 'グリーン',   value: '#2ECC71' },
  { label: 'ブルー',     value: '#3498DB' },
  { label: 'イエロー',   value: '#F39C12' },
  { label: 'ピンク',     value: '#E91E8C' },
]
