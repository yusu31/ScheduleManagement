'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Sun, CalendarRange, Ticket, Sprout, MapPin, Trophy, Palette, Shield, Landmark, Utensils, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserPreference } from '@/contexts/UserPreferenceContext'
import UserProfilePanel from '@/components/user/UserProfilePanel'

type NavItem = { href: string; label: string; Icon: LucideIcon; comingSoon?: boolean }

const navItems: NavItem[] = [
  { href: '/today',       label: '今日',       Icon: Sun },
  { href: '/calendar',   label: 'カレンダー',  Icon: CalendarRange },
  { href: '/events',     label: 'イベント',    Icon: Ticket },
  { href: '/spots',      label: 'スポット',    Icon: Landmark },
  { href: '/restaurants',label: 'グルメ',      Icon: Utensils },
  { href: '/conquer',    label: 'マップ制覇',  Icon: MapPin },
  { href: '/conquer/collection', label: 'コレクション', Icon: Trophy },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeBg, setThemeBg] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const update = () =>
      setThemeBg(document.documentElement.getAttribute('data-theme-bg'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-bg'],
    })
    return () => observer.disconnect()
  }, [])

  const pathname = usePathname()
  const { isLoggedIn, currentUser, isLoading } = useAuth()
  const { openPicker, currentTheme } = useTheme()
  const { iconPref } = useUserPreference()

  const usesDarkOverlay = themeBg === 'photo' || themeBg === 'dark'

  if (!mounted) {
    return (
      <aside className="hidden md:block w-[240px] shrink-0 h-screen sticky top-0 bg-white/65 backdrop-blur-xl border-r border-white/50 shadow-[1px_0_20px_rgba(0,0,0,0.06)]" />
    )
  }

  const displayName = currentUser?.name || currentUser?.email || '?'
  const initial = displayName[0].toUpperCase()

  return (
    <>
      {/* モバイル用オーバーレイ背景 */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed md:sticky inset-y-0 left-0 md:top-0 z-50
        w-[240px] h-screen shrink-0
        flex flex-col
        backdrop-blur-xl
        overflow-visible
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${usesDarkOverlay
          ? 'bg-black/35 border-r border-white/15 shadow-[1px_0_20px_rgba(0,0,0,0.2)]'
          : 'bg-white/70 border-r border-white/50 shadow-[1px_0_20px_rgba(0,0,0,0.06)]'
        }
      `}>
      {/* ロゴ */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary/15 group-hover:bg-primary/25 transition-colors">
            <Sprout size={17} className="text-primary" />
          </span>
          <span className={`font-bold text-[14px] tracking-wide leading-tight ${usesDarkOverlay ? 'text-white' : 'text-app-text'}`}>
            Roami
          </span>
        </Link>
      </div>

      {/* 検索ボックス */}
      <div className="px-5 pb-3">
        <form
          onSubmit={e => {
            e.preventDefault()
            if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
          }}
          className="relative"
        >
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${usesDarkOverlay ? 'text-white/50' : 'text-app-sub'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="イベント・スポット・グルメを検索"
            className={`
              w-full pl-9 pr-3 py-2 rounded-xl text-[12px] outline-none transition-colors
              ${usesDarkOverlay
                ? 'bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15'
                : 'bg-white/60 text-app-text placeholder:text-app-sub/60 focus:bg-white'
              }
            `}
          />
        </form>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon, comingSoon }) => {
            const isActive = !comingSoon && (pathname === href || (href !== '/' && pathname.startsWith(href)))

            if (comingSoon) {
              return (
                <li key={href}>
                  <div className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium
                    cursor-not-allowed select-none
                    ${usesDarkOverlay ? 'text-white/30' : 'text-app-sub/40'}
                  `}>
                    <Icon size={16} />
                    {label}
                    <span className={`
                      ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full
                      ${usesDarkOverlay ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400'}
                    `}>
                      準備中
                    </span>
                  </div>
                </li>
              )
            }

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium
                    transition-all duration-150
                    ${isActive
                      ? usesDarkOverlay
                        ? 'bg-white/15 text-white'
                        : 'bg-primary/12 text-primary shadow-[inset_0_1px_3px_rgba(95,139,139,0.1)]'
                      : usesDarkOverlay
                        ? 'text-white/70 hover:bg-white/10 hover:text-white'
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
                ? usesDarkOverlay ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                : usesDarkOverlay ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-app-sub hover:bg-white/60 hover:text-app-text'
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
              ${usesDarkOverlay
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
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
      <div className={`px-3 pb-5 pt-3 relative border-t ${usesDarkOverlay ? 'border-white/10' : 'border-white/50'}`}>
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
                    ${usesDarkOverlay
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
                  <span className={`text-[12px] font-medium truncate flex-1 ${usesDarkOverlay ? 'text-white' : 'text-app-text'}`}>
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
                    ${usesDarkOverlay
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
        <p className={`text-[10px] text-center mt-4 ${usesDarkOverlay ? 'text-white/40' : 'text-app-sub/60'}`}>
          © {new Date().getFullYear()} Roami
        </p>
      </div>
    </aside>
    </>
  )
}
