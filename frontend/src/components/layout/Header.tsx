'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { isLoggedIn, currentUser, signOut, isLoading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // サインアウト失敗時もUIはリセット済みなので何もしない
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-green-700 hover:text-green-800">
          福島イベントナビ
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm text-gray-600 hover:text-green-700 font-medium"
          >
            イベント一覧
          </Link>
          <Link
            href="/calendar"
            className="text-sm text-gray-600 hover:text-green-700 font-medium"
          >
            カレンダー
          </Link>

          {!isLoading && (
            <>
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {currentUser?.name || currentUser?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/sign-in"
                    className="text-sm text-gray-600 hover:text-green-700 font-medium"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-sm bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-md"
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
