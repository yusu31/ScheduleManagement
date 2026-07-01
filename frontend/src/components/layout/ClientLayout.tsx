'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Sprout } from 'lucide-react'
import Link from 'next/link'
import Sidebar from './Sidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usesDarkOverlay, setUsesDarkOverlay] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const update = () => {
      const bg = document.documentElement.getAttribute('data-theme-bg')
      setUsesDarkOverlay(bg === 'photo' || bg === 'dark')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-bg'],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* モバイルヘッダー（md以上では非表示） */}
        <header className={`
          md:hidden sticky top-0 z-30 h-14
          flex items-center gap-3 px-4
          backdrop-blur-xl border-b
          transition-colors duration-300
          ${usesDarkOverlay
            ? 'bg-black/35 border-white/15'
            : 'bg-white/70 border-white/50 shadow-[0_1px_12px_rgba(0,0,0,0.05)]'
          }
        `}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`
              w-8 h-8 flex items-center justify-center rounded-lg
              transition-colors
              ${usesDarkOverlay
                ? 'text-white/80 hover:bg-white/10'
                : 'text-app-sub hover:bg-black/5'
              }
            `}
            aria-label="メニューを開く"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15 group-hover:bg-primary/25 transition-colors">
              <Sprout size={15} className="text-primary" />
            </span>
            <span className={`font-bold text-[14px] tracking-wide ${usesDarkOverlay ? 'text-white' : 'text-app-text'}`}>
              Roami
            </span>
          </Link>
        </header>
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
