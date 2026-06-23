'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Sun, CalendarDays, CalendarRange, Ticket, Sprout, MapPin, Trophy, Palette, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, isThemeDark } from '@/contexts/ThemeContext'
import { useUserPreference } from '@/contexts/UserPreferenceContext'
import UserProfilePanel from '@/components/user/UserProfilePanel'

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/today', label: '今日', Icon: Sun },
  { href: '/personal-events', label: '予定', Icon: CalendarDays },
  { href: '/calendar', label: 'カレンダー', Icon: CalendarRange },
  { href: '/events', label: 'イベント', Icon: Ticket },
  { href: '/conquer', label: 'マップ制覇', Icon: MapPin },
  { href: '/conquer/collection', label: 'コレクション', Icon: Trophy },
]

export default function Sidebar() {
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const userButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  const pathname = usePathname()
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  const { openPicker, currentTheme } = useTheme()
  const { iconPref } = useUserPreference()

  const isDark = isThemeDark(currentTheme)

  if (!mounted) {
    return (
      <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-white/65 backdrop-blur-xl border-r border-white/50 shadow-[1px_0_20px_rgba(0,0,0,0.06)]" />
    )
  }

  const displayName = currentUser?.name || currentUser?.email || '?'
  const initial = displayName[0].toUpperCase()

  return (
    <aside className={`
      w-[240px] shrink-0 h-screen sticky top-0
      flex flex-col
      backdrop-blur-xl
      overflow-visible
      transition-colors duration-300
      ${isDark
        ? 'bg-black/30 border-r border-white/15 shadow-[1px_0_20px_rgba(0,0,0,0.2)]'
        : 'bg-white/65 border-r border-white/50 shadow-[1px_0_20px_rgba(0,0,0,0.06)]'
      }
    `}>
      {/* ロゴ */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/15 group-hover:bg-primary/25 transition-colors">
            <Sprout size={17} className="text-primary" />
          </span>
          <span className={`font-bold text-[14px] tracking-wide leading-tight ${isDark ? 'text-white' : 'text-app-text'}`}>
            Roami
          </span>
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium
                    transition-all duration-150
                    ${isActive
                      ? isDark
                        ? 'bg-white/15 text-white'
                        : 'bg-primary/12 text-primary shadow-[inset_0_1px_3px_rgba(95,139,139,0.1)]'
                      : isDark
                        ? 'text-white/60 hover:bg-white/10 hover:text-white'
                        : 'text-app-sub hover:bg-white/60 hover:text-app-text'
                    }
                  `}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Admin リンク（adminユーザーのみ） */}
      {!isLoading && isLoggedIn && currentUser?.role === 'admin' && (
        <div className="px-3 pb-1">
          <Link
            href="/admin/events"
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
              text-[13px] font-medium transition-colors
              ${pathname.startsWith('/admin')
                ? isDark ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                : isDark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-app-sub hover:bg-white/60 hover:text-app-text'
              }
            `}
          >
            <Shield size={15} />
            <span>管理画面</span>
          </Link>
        </div>
      )}

      {/* テーマ変更ボタン（ログイン前のみ表示） */}
      {!isLoading && !isLoggedIn && (
        <div className="px-3 pb-2">
          <button
            onClick={openPicker}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
              text-[13px] font-medium transition-colors
              ${isDark
                ? 'text-white/60 hover:bg-white/10 hover:text-white'
                : 'text-app-sub hover:bg-white/60 hover:text-app-text'
              }
            `}
          >
            <Palette size={15} />
            <span>テーマ</span>
            {currentTheme && (
              <span className="ml-auto text-[11px] text-primary font-semibold truncate max-w-[70px]">
                {currentTheme.name}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 下部：認証エリア */}
      <div className={`px-3 pb-5 pt-3 relative border-t ${isDark ? 'border-white/10' : 'border-white/50'}`}>
        {!isLoading && (
          <>
            {isLoggedIn ? (
              <>
                {profileOpen && (
                  <UserProfilePanel
                    onClose={() => setProfileOpen(false)}
                    anchorRef={userButtonRef as React.RefObject<HTMLElement>}
                  />
                )}
                <button
                  ref={userButtonRef}
                  onClick={() => setProfileOpen(prev => !prev)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                    border transition-colors text-left
                    ${isDark
                      ? 'bg-white/10 border-white/15 hover:bg-white/20'
                      : 'bg-white/50 border-white/60 hover:bg-white/70'
                    }
                  `}
                >
                  {iconPref.imageUrl ? (
                    <span
                      className="w-7 h-7 rounded-full shrink-0"
                      style={{
                        backgroundImage: `url(${iconPref.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: iconPref.objectPosition || '50% 20%',
                      }}
                    />
                  ) : (
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
                      style={{ backgroundColor: iconPref.color }}
                    >
                      {iconPref.emoji || initial}
                    </span>
                  )}
                  <span className={`text-[12px] font-medium truncate flex-1 ${isDark ? 'text-white' : 'text-app-text'}`}>
                    {displayName}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/auth/sign-in"
                  className="
                    w-full text-center text-[13px] font-semibold
                    bg-primary text-white py-2 rounded-xl
                    hover:bg-primary-dark transition-colors
                    shadow-[0_2px_8px_rgba(95,139,139,0.3)]
                  "
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/sign-up"
                  className={`
                    w-full text-center text-[13px] font-medium
                    py-2 rounded-xl border transition-colors
                    ${isDark
                      ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                      : 'bg-white/60 hover:bg-white/80 text-app-text border-white/70'
                    }
                  `}
                >
                  新規登録
                </Link>
              </div>
            )}
          </>
        )}
        <p className={`text-[10px] text-center mt-4 ${isDark ? 'text-white/40' : 'text-app-sub/60'}`}>
          © {new Date().getFullYear()} Roami
        </p>
      </div>
    </aside>
  )
}
