'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  title: string
  message: string
  dangerNote?: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  dangerNote,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* オーバーレイ背景 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* モーダル本体 */}
      <div className="
        relative w-full max-w-sm
        bg-white/90 backdrop-blur-2xl
        rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]
        p-6 animate-in fade-in zoom-in-95 duration-150
      ">
        <h2 className="text-[15px] font-bold text-app-text mb-2">{title}</h2>
        <p className="text-[13px] text-app-text leading-relaxed mb-1">{message}</p>
        {dangerNote && (
          <p className="text-[12px] text-red-500 font-medium mt-1">{dangerNote}</p>
        )}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="
              flex-1 py-2.5 rounded-xl text-[13px] font-medium
              bg-white/70 hover:bg-white text-app-text
              border border-white/60 transition-colors
            "
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors
              ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
