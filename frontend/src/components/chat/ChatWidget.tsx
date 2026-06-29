'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Sprout } from 'lucide-react'
import Image from 'next/image'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = ['今週のイベントは？', 'おすすめスポットは？', '美味しいお店は？']

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [themeBg, setThemeBg] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ドラッグ移動
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const basePosRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0 })
  const hasDraggedRef = useRef(false)

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // マウス・タッチのドラッグイベントをwindowに登録（マウント时1回）
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const dx = e.clientX - dragStartRef.current.mouseX
      const dy = e.clientY - dragStartRef.current.mouseY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true
      setPosition({ x: basePosRef.current.x + dx, y: basePosRef.current.y + dy })
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      basePosRef.current = {
        x: basePosRef.current.x + (e.clientX - dragStartRef.current.mouseX),
        y: basePosRef.current.y + (e.clientY - dragStartRef.current.mouseY),
      }
      isDraggingRef.current = false
      setIsDragging(false)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return
      const t = e.touches[0]
      const dx = t.clientX - dragStartRef.current.mouseX
      const dy = t.clientY - dragStartRef.current.mouseY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true
      setPosition({ x: basePosRef.current.x + dx, y: basePosRef.current.y + dy })
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) return
      const t = e.changedTouches[0]
      basePosRef.current = {
        x: basePosRef.current.x + (t.clientX - dragStartRef.current.mouseX),
        y: basePosRef.current.y + (t.clientY - dragStartRef.current.mouseY),
      }
      isDraggingRef.current = false
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const startDrag = (clientX: number, clientY: number) => {
    isDraggingRef.current = true
    setIsDragging(true)
    hasDraggedRef.current = false
    dragStartRef.current = { mouseX: clientX, mouseY: clientY }
  }

  const usesDarkOverlay = themeBg === 'photo' || themeBg === 'dark'
  // theme-card-bg は photo→白背景・dark→黒背景のためパネル内色はdarkのみ暗くする
  const usesDarkPanel = themeBg === 'dark'

  const handleSend = async (text = input) => {
    const userMessage = text.trim()
    if (!userMessage || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || data.error || 'エラーが発生しました' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '通信エラーが発生しました。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-50"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {/* ping */}
      {!isOpen && (
        <span className="absolute -inset-1 rounded-[24px] bg-[#c8bef0]/30 animate-ping" />
      )}

      {/* チャットパネル（ボタンの上に absolute 配置・ドラッグで追従） */}
      {isOpen && (
        <div
          onMouseDown={e => e.stopPropagation()}
          className={`
            absolute bottom-[82px] right-0 z-10
            w-[340px] h-[510px]
            rounded-2xl shadow-2xl
            flex flex-col overflow-hidden
            theme-card-bg
            ${usesDarkOverlay ? 'ring-1 ring-white/15' : 'ring-1 ring-black/8'}
          `}
        >
          {/* グラデーションヘッダー */}
          <div className="bg-gradient-to-r from-[#5f8b8b] to-[#3a7272] px-4 py-2.5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center shrink-0">
              <Sprout size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[14px] leading-tight">Roami AI</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="text-white/70 text-[11px]">AI アシスタント</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="チャットを閉じる"
            >
              <X size={16} />
            </button>
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Image
                  src="/roamichan.png"
                  alt="Roami AIマスコット ろーみー"
                  width={90}
                  height={90}
                  className="mb-3"
                  style={{ filter: 'drop-shadow(0 8px 24px rgba(180,160,230,0.55))' }}
                />
                <p className={`text-[15px] font-bold mb-1 ${usesDarkPanel ? 'text-white' : 'text-app-text'}`}>
                  こんにちは、ろーみーです！
                </p>
                <p className={`text-[12px] leading-relaxed mb-5 ${usesDarkPanel ? 'text-white/60' : 'text-app-sub'}`}>
                  福島のイベント・観光・グルメ
                  <br />
                  何でも気軽に聞いてください
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className={`
                        text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors
                        ${usesDarkPanel
                          ? 'bg-white/15 text-white/80 hover:bg-white/25'
                          : 'bg-primary-light text-primary hover:bg-primary/15'
                        }
                      `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="relative w-7 h-7 rounded-xl shrink-0 mt-1 overflow-hidden">
                    <Image src="/roamichan.png" alt="ろーみー" fill className="object-cover" />
                  </div>
                )}
                <div
                  className={`
                    max-w-[76%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#5f8b8b] to-[#3d7070] text-white rounded-tr-sm'
                      : usesDarkPanel
                        ? 'bg-white/15 text-white rounded-tl-sm'
                        : 'bg-primary-light text-app-text rounded-tl-sm'
                    }
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="relative w-7 h-7 rounded-xl shrink-0 mt-1 overflow-hidden">
                  <Image src="/roamichan.png" alt="ろーみー" fill className="object-cover" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 ${usesDarkPanel ? 'bg-white/15' : 'bg-primary-light'}`}>
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div
            className={`
              px-3 py-3 border-t flex items-end gap-2 shrink-0
              ${usesDarkPanel ? 'border-white/10 bg-black/15' : 'border-app-border/50 bg-white/30'}
            `}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              rows={1}
              className={`
                flex-1 resize-none rounded-xl px-3 py-2 text-[13px]
                outline-none border focus:border-primary/50 transition-colors
                ${usesDarkPanel
                  ? 'bg-white/10 text-white placeholder-white/40 border-white/15'
                  : 'bg-white/80 text-app-text placeholder-app-sub/60 border-app-border/60'
                }
              `}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5f8b8b] to-[#3d7070] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="送信"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* フローティングボタン */}
      {isOpen ? (
        <button
          onClick={() => setIsOpen(false)}
          className="relative flex items-center justify-center w-[66px] h-[66px] rounded-[20px] bg-white/80 backdrop-blur-sm ring-2 ring-[#c8bef0]/50 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="チャットを閉じる"
        >
          <X size={20} className="text-[#6a5a9a]" />
        </button>
      ) : (
        <button
          onMouseDown={e => { startDrag(e.clientX, e.clientY); e.preventDefault() }}
          onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onClick={() => { if (!hasDraggedRef.current) setIsOpen(true) }}
          className="roami-float-btn relative w-[66px] h-[66px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="AIチャットを開く"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <Image
            src="/roamichan.png"
            alt="ろーみー"
            width={60}
            height={60}
            className="roami-mascot"
            style={{
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.18))',
              transformOrigin: '50% 85%',
            }}
          />
        </button>
      )}
    </div>
  )
}
