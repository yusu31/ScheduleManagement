'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import Image from 'next/image'
import RoamiMascot from './RoamiMascot'

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
    <>
      {/* フローティングボタン：マスコットキャラクター「ロミ」 */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-primary/25 animate-ping" />
        )}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`
            relative flex items-center justify-center rounded-2xl
            shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95
            overflow-hidden
            ${isOpen
              ? 'w-12 h-12 bg-white/90 ring-2 ring-primary/25'
              : 'w-[62px] h-[62px] bg-gradient-to-br from-[#dff0ed] to-[#c0e0d8] ring-2 ring-white/70'
            }
          `}
          aria-label={isOpen ? 'チャットを閉じる' : 'AIチャットを開く'}
        >
          {isOpen
            ? <X size={20} className="text-primary-dark" />
            : <RoamiMascot size={68} />
          }
        </button>
      </div>

      {/* チャットパネル */}
      {isOpen && (
        <div
          className={`
            fixed bottom-[84px] right-5 z-50
            w-[340px] h-[510px]
            rounded-2xl shadow-2xl
            flex flex-col overflow-hidden
            theme-card-bg
            ${usesDarkOverlay ? 'ring-1 ring-white/15' : 'ring-1 ring-black/8'}
          `}
        >
          {/* グラデーションヘッダー */}
          <div className="bg-gradient-to-r from-[#5f8b8b] to-[#3a7272] px-4 py-2.5 flex items-center gap-3 shrink-0">
            {/* ヘッダー内のミニマスコット */}
            <div className="w-10 h-10 rounded-xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center shrink-0 overflow-hidden">
              <RoamiMascot size={44} />
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
                {/* 空の状態：AI生成マスコット画像を表示 */}
                <div className={`rounded-2xl p-2 mb-3 ${usesDarkPanel ? 'bg-white/10' : 'bg-primary-light'}`}>
                  <Image
                    src="/romi.png"
                    alt="Roami AIマスコット ロミ"
                    width={80}
                    height={80}
                    className="rounded-xl"
                  />
                </div>
                <p className={`text-[15px] font-bold mb-1 ${usesDarkPanel ? 'text-white' : 'text-app-text'}`}>
                  こんにちは、ロミです！
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
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1 overflow-hidden ${usesDarkPanel ? 'bg-white/15' : 'bg-primary-light'}`}>
                    <RoamiMascot size={30} />
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
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${usesDarkPanel ? 'bg-white/15' : 'bg-primary-light'}`}>
                  <RoamiMascot size={30} />
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
    </>
  )
}
