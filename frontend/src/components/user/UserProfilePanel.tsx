'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  X, Palette, RotateCcw, KeyRound, Trash2, LogOut,
  Check, Pencil, MapPin, CalendarDays, Trophy, ChevronRight, Upload,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserPreference, ICON_COLORS, ICON_PRESETS } from '@/contexts/UserPreferenceContext'
import type { IconType } from '@/contexts/UserPreferenceContext'
import ConfirmModal from '@/components/user/ConfirmModal'
import apiClient from '@/lib/axios'

type Stats = {
  visited_municipalities: number
  personal_events_count: number
  conquered_regions_count: number
}

// サブモーダルの種類（全て中央表示）
type SubModal = 'icon' | 'name' | 'password' | null

// 確認ダイアログの種類
type ConfirmType = 'logout' | 'resetAll' | 'deleteAccount' | null

type Props = {
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export default function UserProfilePanel({ onClose, anchorRef }: Props) {
  const { currentUser, signOut, updateProfile, updatePassword, deleteAccount } = useAuth()
  const { openPicker } = useTheme()
  const { iconPref, setIconPref } = useUserPreference()

  const [subModal, setSubModal]       = useState<SubModal>(null)
  const [confirmType, setConfirmType] = useState<ConfirmType>(null)
  const [stats, setStats]             = useState<Stats | null>(null)
  const [panelStyle, setPanelStyle]   = useState<React.CSSProperties>({})
  const [mounted, setMounted]         = useState(false)

  // 表示名変更
  const [nameInput, setNameInput]   = useState(currentUser?.name || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError]   = useState('')
  const [nameDone, setNameDone]     = useState(false)

  // パスワード変更
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwDone, setPwDone]         = useState(false)

  // アイコン選択（一時）
  const [iconTab, setIconTab]               = useState<IconType>(iconPref.type || 'color')
  const [tempColor, setTempColor]           = useState(iconPref.color)
  const [tempType, setTempType]             = useState<IconType>(iconPref.type || 'color')
  const [tempImageUrl, setTempImageUrl]     = useState<string | null>(iconPref.imageUrl || null)
  const [tempObjPos, setTempObjPos]         = useState<string>(iconPref.objectPosition || '50% 20%')

  const panelRef = useRef<HTMLDivElement>(null)

  // パネル位置計算
  const calcPosition = useCallback(() => {
    if (!anchorRef.current) return
    const rect  = anchorRef.current.getBoundingClientRect()
    const w     = 300
    const gap   = 8
    const left  = Math.max(gap, Math.min(rect.left, window.innerWidth - w - gap))
    setPanelStyle({ position: 'fixed', left, bottom: window.innerHeight - rect.top + gap, width: w })
  }, [anchorRef])

  useEffect(() => {
    setMounted(true)
    calcPosition()
    window.addEventListener('resize', calcPosition)
    return () => window.removeEventListener('resize', calcPosition)
  }, [calcPosition])

  useEffect(() => {
    apiClient.get('/api/v1/users/stats').then(res => setStats(res.data)).catch(() => {})
  }, [])

  // パネル外クリックで閉じる（サブモーダル・確認ダイアログ表示中は除く）
  useEffect(() => {
    if (subModal || confirmType) return
    const handle = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose, anchorRef, subModal, confirmType])

  const displayName = currentUser?.name || currentUser?.email || '?'
  const initial     = displayName[0].toUpperCase()

  // ─── アクション ───────────────────────────────────────────────
  const handleNameSave = async () => {
    if (!nameInput.trim()) { setNameError('名前を入力してください'); return }
    setNameLoading(true); setNameError('')
    try {
      await updateProfile(nameInput.trim())
      setNameDone(true)
      setTimeout(() => { setNameDone(false); setSubModal(null) }, 1000)
    } catch { setNameError('更新に失敗しました') }
    finally   { setNameLoading(false) }
  }

  const handlePasswordSave = async () => {
    if (!currentPw || !newPw || !confirmPw) { setPwError('すべての項目を入力してください'); return }
    if (newPw !== confirmPw) { setPwError('新しいパスワードが一致しません'); return }
    if (newPw.length < 6)   { setPwError('パスワードは6文字以上にしてください'); return }
    setPwLoading(true); setPwError('')
    try {
      await updatePassword(currentPw, newPw, confirmPw)
      setPwDone(true)
      setTimeout(() => { setPwDone(false); closePasswordModal() }, 1200)
    } catch { setPwError('現在のパスワードが正しくないか、更新に失敗しました') }
    finally   { setPwLoading(false) }
  }

  const closePasswordModal = () => {
    setSubModal(null); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwError(''); setPwDone(false)
  }

  const handleConfirm = async () => {
    if (confirmType === 'logout') {
      await signOut(); onClose()
    } else if (confirmType === 'resetAll') {
      await Promise.allSettled([
        apiClient.delete('/api/v1/region_conquests/destroy_all'),
        apiClient.delete('/api/v1/visit_records/destroy_all'),
      ])
      setConfirmType(null)
    } else if (confirmType === 'deleteAccount') {
      await deleteAccount(); onClose()
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')!
        const size = Math.min(img.width, img.height)
        const ox = (img.width - size) / 2
        const oy = (img.height - size) / 2
        ctx.drawImage(img, ox, oy, size, size, 0, 0, 200, 200)
        setTempImageUrl(canvas.toDataURL('image/jpeg', 0.85))
        setTempType('photo')
        setTempObjPos('center')
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleIconSave = () => {
    setIconPref({
      emoji: '',
      color: tempColor,
      type: tempType,
      imageUrl: tempType !== 'color' ? (tempImageUrl ?? undefined) : undefined,
      objectPosition: tempType !== 'color' ? tempObjPos : undefined,
    })
    setSubModal(null)
  }

  if (!mounted) return null

  const confirmConfigs: Record<NonNullable<ConfirmType>, { title: string; message: string; dangerNote: string; confirmLabel: string; danger: boolean }> = {
    logout:        { title: 'ログアウト',       message: 'ログアウトしますか？',                                          dangerNote: '',                    confirmLabel: 'ログアウト',  danger: false },
    resetAll:      { title: '記録をリセット',   message: 'マップ制覇の記録・訪問写真・コレクションをすべて削除します。', dangerNote: 'この操作は取り消せません。', confirmLabel: 'リセットする', danger: true  },
    deleteAccount: { title: 'アカウントを削除', message: 'アカウントと関連するすべてのデータを削除します。',             dangerNote: 'この操作は取り消せません。', confirmLabel: '削除する',     danger: true  },
  }

  const panelClass =
    "theme-card-bg bg-white/95 backdrop-blur-2xl border border-black/8 rounded-2xl " +
    "shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden"

  // ─── 中央モーダル共通ラッパー ────────────────────────────────
  const CenterModal = ({
    children, onClose: close, title, icon: Icon,
  }: { children: React.ReactNode; onClose: () => void; title: string; icon?: React.ElementType }) =>
    createPortal(
      <div className="fixed inset-0 z-[9500] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
        <div
          className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] p-6 animate-in fade-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-5">
            {Icon && <Icon size={16} className="text-primary" />}
            <h2 className="text-[15px] font-bold text-app-text flex-1">{title}</h2>
            <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors">
              <X size={14} className="text-app-sub" />
            </button>
          </div>
          {children}
        </div>
      </div>,
      document.body
    )

  return createPortal(
    <>
      {/* ── 確認ダイアログ ── */}
      {confirmType && (
        <ConfirmModal {...confirmConfigs[confirmType]} onConfirm={handleConfirm} onCancel={() => setConfirmType(null)} />
      )}

      {/* ── 表示名変更モーダル ── */}
      {subModal === 'name' && (
        <CenterModal title="表示名を変更" icon={Pencil} onClose={() => setSubModal(null)}>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="新しい表示名"
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/4 text-[13px] text-app-text outline-none focus:ring-2 focus:ring-primary/40 mb-3"
            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
          />
          {nameError && <p className="text-[11px] text-red-500 mb-3">{nameError}</p>}
          <button
            onClick={handleNameSave}
            disabled={nameLoading}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {nameDone ? <><Check size={14} />保存しました</> : nameLoading ? '保存中...' : '保存する'}
          </button>
        </CenterModal>
      )}

      {/* ── パスワード変更モーダル ── */}
      {subModal === 'password' && (
        <CenterModal title="パスワードを変更" icon={KeyRound} onClose={closePasswordModal}>
          {[
            { label: '現在のパスワード', val: currentPw, set: setCurrentPw },
            { label: '新しいパスワード', val: newPw,      set: setNewPw      },
            { label: '確認（再入力）',   val: confirmPw,  set: setConfirmPw  },
          ].map(({ label, val, set }) => (
            <input
              key={label}
              type="password"
              placeholder={label}
              value={val}
              onChange={e => set(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-black/4 text-[13px] text-app-text outline-none focus:ring-2 focus:ring-primary/40 mb-2"
            />
          ))}
          {pwError && <p className="text-[11px] text-red-500 mb-2">{pwError}</p>}
          <div className="text-right mb-3">
            <Link
              href="/auth/forgot-password"
              onClick={closePasswordModal}
              className="text-[11px] text-primary hover:underline"
            >
              パスワードを忘れた場合
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={closePasswordModal}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-black/5 hover:bg-black/8 text-app-text transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handlePasswordSave}
              disabled={pwLoading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pwDone ? <><Check size={14} />変更しました</> : pwLoading ? '変更中...' : '変更する'}
            </button>
          </div>
        </CenterModal>
      )}

      {/* ── アイコン変更モーダル ── */}
      {subModal === 'icon' && (
        <CenterModal title="アイコンを変更" icon={Pencil} onClose={() => setSubModal(null)}>
          {/* プレビュー */}
          <div className="flex justify-center mb-5">
            {tempType !== 'color' && tempImageUrl ? (
              <span
                className="w-20 h-20 rounded-full block shadow-lg"
                style={{
                  backgroundImage: `url(${tempImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: tempObjPos,
                }}
              />
            ) : (
              <span
                className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg"
                style={{ backgroundColor: tempColor }}
              >
                {initial}
              </span>
            )}
          </div>

          {/* タブ */}
          <div className="flex rounded-xl bg-black/5 p-1 mb-4 gap-1">
            {(['color', 'preset', 'photo'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setIconTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  iconTab === tab ? 'bg-white shadow-sm text-app-text' : 'text-app-sub hover:text-app-text'
                }`}
              >
                {tab === 'color' ? 'カラー' : tab === 'preset' ? 'プリセット' : '写真'}
              </button>
            ))}
          </div>

          {/* カラータブ */}
          {iconTab === 'color' && (
            <div className="grid grid-cols-4 gap-2 mb-5">
              {ICON_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setTempColor(c.value); setTempType('color'); setTempImageUrl(null) }}
                  className={`
                    h-10 rounded-xl transition-all font-medium text-[12px] text-white
                    ${tempType === 'color' && tempColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-105 shadow-md' : 'hover:scale-105'}
                  `}
                  style={{ backgroundColor: c.value }}
                >
                  {tempType === 'color' && tempColor === c.value && <Check size={14} className="mx-auto" />}
                </button>
              ))}
            </div>
          )}

          {/* プリセットタブ */}
          {iconTab === 'preset' && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {ICON_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => { setTempImageUrl(preset.url); setTempType('preset'); setTempObjPos(preset.objectPosition) }}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    tempType === 'preset' && tempImageUrl === preset.url
                      ? 'ring-2 ring-offset-2 ring-primary scale-105'
                      : 'hover:scale-105'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" style={{ objectPosition: preset.objectPosition }} />
                  {tempType === 'preset' && tempImageUrl === preset.url && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 写真タブ */}
          {iconTab === 'photo' && (
            <div className="mb-5">
              <label className="
                flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-black/15
                cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors
              ">
                <Upload size={20} className="text-app-sub" />
                <span className="text-[12px] text-app-sub">クリックして写真を選択</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              {tempType === 'photo' && tempImageUrl && (
                <p className="text-[11px] text-primary text-center mt-2">プレビューに反映しました</p>
              )}
            </div>
          )}

          <button
            onClick={handleIconSave}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary-dark transition-colors"
          >
            保存する
          </button>
        </CenterModal>
      )}

      {/* ── プロフィールパネル本体 ── */}
      <div ref={panelRef} className={panelClass} style={{ ...panelStyle, zIndex: 9000 }}>

        {/* ヘッダー：アバター + ユーザー情報 */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={() => setSubModal('icon')}
              className="relative group"
              title="アイコンを変更"
            >
              {iconPref.imageUrl ? (
                <span
                  className="w-[60px] h-[60px] rounded-full block shadow-md transition-transform group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${iconPref.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: iconPref.objectPosition || '50% 20%',
                  }}
                />
              ) : (
                <span
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: iconPref.color }}
                >
                  {initial}
                </span>
              )}
              <span className="absolute inset-0 rounded-full bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil size={14} className="text-white" />
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/8 transition-colors mt-0.5"
            >
              <X size={15} className="text-app-sub" />
            </button>
          </div>
          <p className="text-[16px] font-bold text-app-text leading-tight">{displayName}</p>
          <p className="text-[12px] text-app-sub mt-0.5">{currentUser?.email}</p>
        </div>

        {/* 統計バッジ（予定→訪問→制覇 の順） */}
        {stats && (
          <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
            {[
              { icon: CalendarDays, value: stats.personal_events_count,   label: '予定'   },
              { icon: MapPin,       value: stats.visited_municipalities,   label: '訪問'   },
              { icon: Trophy,       value: stats.conquered_regions_count,  label: '制覇'   },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center bg-black/4 rounded-xl py-2.5">
                <Icon size={12} className="text-primary mb-1" />
                <span className="text-[14px] font-bold text-app-text leading-none">{value}</span>
                <span className="text-[10px] text-app-sub mt-0.5 leading-none">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-black/8" />

        {/* メニュー */}
        <div className="py-2">
          <PanelRow icon={Palette} label="テーマ"          onClick={() => { openPicker(); onClose() }} />
          <PanelRow icon={Pencil}  label="表示名を変更"    onClick={() => setSubModal('name')}     hasArrow />

          <div className="border-t border-black/8 my-1" />

          <PanelRow icon={RotateCcw} label="記録をリセット"  onClick={() => setConfirmType('resetAll')}     danger />

          <div className="border-t border-black/8 my-1" />

          <PanelRow icon={KeyRound} label="パスワードを変更" onClick={() => setSubModal('password')} hasArrow />
          <PanelRow icon={Trash2}   label="アカウントを削除" onClick={() => setConfirmType('deleteAccount')} danger />

          <div className="border-t border-black/8 my-1" />

          <PanelRow icon={LogOut} label="ログアウト" onClick={() => setConfirmType('logout')} />
        </div>
      </div>
    </>,
    document.body
  )
}

type PanelRowProps = {
  icon: React.ElementType
  label: string
  onClick: () => void
  danger?: boolean
  hasArrow?: boolean
}

function PanelRow({ icon: Icon, label, onClick, danger, hasArrow }: PanelRowProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium
        transition-colors text-left
        ${danger ? 'text-red-500 hover:bg-red-50' : 'text-app-text hover:bg-black/5'}
      `}
    >
      <Icon size={15} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {hasArrow && <ChevronRight size={13} className="text-app-sub/60 shrink-0" />}
    </button>
  )
}
