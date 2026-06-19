'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sprout, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Sprout size={24} className="text-primary" />
          </span>
          <h1 className="text-[22px] font-bold text-app-text">パスワードを忘れた場合</h1>
          <p className="text-[13px] text-app-sub mt-1">登録済みのメールアドレスを入力してください</p>
        </div>

        <div className="
          bg-white/70 backdrop-blur-xl
          border border-white/60
          rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]
          px-6 py-7
        ">
          {submitted ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-4">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h2 className="text-[16px] font-bold text-app-text mb-2">送信しました</h2>
              <p className="text-[13px] text-app-sub leading-relaxed">
                {email} にパスワードリセットの<br />
                メールを送信しました。<br />
                メールボックスをご確認ください。
              </p>
              <Link
                href="/auth/sign-in"
                className="
                  inline-block mt-6 px-6 py-2.5 rounded-xl
                  bg-primary text-white text-[13px] font-semibold
                  hover:bg-primary-dark transition-colors
                "
              >
                ログインに戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-app-text">
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    autoFocus
                    className="
                      w-full pl-9 pr-3.5 py-2.5 rounded-xl
                      bg-white border border-app-border
                      text-[14px] text-app-text placeholder:text-app-sub/60
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      transition-colors
                    "
                  />
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-sub" />
                </div>
              </div>
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
                {isSubmitting ? '送信中...' : 'リセットメールを送信'}
              </button>
            </form>
          )}
        </div>

        {!submitted && (
          <div className="flex items-center justify-center mt-5">
            <Link
              href="/auth/sign-in"
              className="flex items-center gap-1.5 text-[13px] text-app-sub hover:text-app-text transition-colors"
            >
              <ArrowLeft size={13} />
              ログインに戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
