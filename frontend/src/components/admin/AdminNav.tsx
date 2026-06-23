'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListChecks, Sparkles } from 'lucide-react'

const tabs = [
  { href: '/admin/events', label: 'イベント管理', Icon: ListChecks },
  { href: '/admin/ai-import', label: 'AIインポート', Icon: Sparkles },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200">
      {tabs.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
