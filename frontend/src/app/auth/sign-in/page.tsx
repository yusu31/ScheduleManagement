'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Sprout, FlaskConical } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, isLoggedIn, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ログイン済みなら /today へリダイレクト
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/today')
    }
  }, [isLoggedIn, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn(email, password)
      router.push('/today')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Sprout size={24} className="text-primary" />
          </span>
          <h1 className="text-[22px] font-bold text-app-text">ログイン</h1>
          <p className="text-[13px] text-app-sub mt-1">Roami へようこそ</p>
        </div>

        {/* フォームカード */}
        <div className="
          bg-white/70 backdrop-blur-xl
          border border-white/60
          rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]
          px-6 py-7
        ">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {/* 開発環境のみ：テストアカウント自動入力 */}
          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={() => { setEmail('2.fortschritt@gmail.com'); setPassword('password123') }}
              className="mb-4 w-full py-2 rounded-xl border border-dashed border-primary/40 text-[12px] text-primary/80 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <FlaskConical size={13} />
              テストアカウントで入力
            </button>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* メールアドレス */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-app-text">
                メールアドレス
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="
                  w-full px-3.5 py-2.5 rounded-xl
                  bg-white border border-app-border
                  text-[14px] text-app-text placeholder:text-app-sub/60
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-colors
                "
              />
            </div>

            {/* パスワード */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-app-text">
                  パスワード
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-primary hover:underline"
                >
                  パスワードを忘れた場合
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                  className="
                    w-full px-3.5 py-2.5 pr-10 rounded-xl
                    bg-white border border-app-border
                    text-[14px] text-app-text placeholder:text-app-sub/60
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-colors
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-sub hover:text-app-text"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                mt-1 w-full py-2.5 rounded-xl
                bg-primary hover:bg-primary-dark
                text-white text-[14px] font-semibold
                shadow-[0_2px_8px_rgba(95,139,139,0.3)]
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        {/* 新規登録リンク */}
        <p className="text-center text-[13px] text-app-sub mt-5">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
