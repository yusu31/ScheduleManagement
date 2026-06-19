'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type IconType = 'color' | 'preset' | 'photo'

export type IconPreference = {
  emoji: string
  color: string
  type?: IconType
  imageUrl?: string          // preset: /icons/... のURL, photo: base64 data URL
  objectPosition?: string    // 画像内での顔の位置（例: '50% 20%'）
}

type UserPreferenceContextType = {
  iconPref: IconPreference
  setIconPref: (pref: IconPreference) => void
}

const DEFAULT_PREF: IconPreference = {
  emoji: '',
  color: '#5F8B8B',
  type: 'color',
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

export const ICON_PRESETS: { id: string; url: string; name: string; objectPosition: string }[] = [
  { id: 'p1', url: '/icons/avatar-1.svg', name: 'さくら',   objectPosition: '50% 20%' },
  { id: 'p2', url: '/icons/avatar-2.svg', name: 'ゆき',     objectPosition: '50% 20%' },
  { id: 'p3', url: '/icons/avatar-3.svg', name: 'はな',     objectPosition: '50% 20%' },
  { id: 'p4', url: '/icons/avatar-4.svg', name: 'るな',     objectPosition: '50% 20%' },
  { id: 'p5', url: '/icons/avatar-5.svg', name: 'もえ',     objectPosition: '50% 20%' },
  { id: 'p6', url: '/icons/avatar-6.svg', name: 'あおい',   objectPosition: '50% 20%' },
  { id: 'p7', url: '/icons/avatar-7.svg', name: 'こはる',   objectPosition: '50% 20%' },
  { id: 'p8', url: '/icons/avatar-8.svg', name: 'みずき',   objectPosition: '50% 20%' },
  { id: 'p9', url: '/icons/avatar-9.svg', name: 'なな',     objectPosition: '50% 20%' },
]
