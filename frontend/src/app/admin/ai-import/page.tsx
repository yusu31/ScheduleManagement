'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Link2, FileText, Image as ImageIcon, Loader2, FileType, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import AdminNav from '@/components/admin/AdminNav'
import { FUKUSHIMA_MUNICIPALITIES } from '@/constants/municipalities'

const AREAS = [...FUKUSHIMA_MUNICIPALITIES, 'その他']
const CATEGORIES = [
  'スポーツ', '音楽', 'アート', '食・グルメ', '自然・アウトドア',
  '文化・伝統', 'ファミリー', 'テクノロジー', '教育', '祭り・イベント', 'その他',
]
const TAGS = ['子連れOK', '無料', '屋外', '室内']

type InputType = 'url' | 'text' | 'image' | 'pdf'

type EventDraft = {
  title: string
  description: string
  location: string
  area: string
  category: string
  start_at: string
  end_at: string
  event_url: string
  image_url: string
  tags: string[]
  capacity: string
  selected: boolean
  expanded: boolean
  status: 'pending' | 'success' | 'error'
  errorMessage?: string
}

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    return new Date(iso).toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function rawToEventDraft(raw: Record<string, string | null>): EventDraft {
  return {
    title: raw.title ?? '',
    description: raw.description ?? '',
    location: raw.location ?? '',
    area: AREAS.includes(raw.area ?? '') ? (raw.area ?? AREAS[0]) : AREAS[0],
    category: CATEGORIES.includes(raw.category ?? '') ? (raw.category ?? CATEGORIES[0]) : CATEGORIES[0],
    start_at: toDatetimeLocal(raw.start_at),
    end_at: toDatetimeLocal(raw.end_at),
    event_url: raw.event_url ?? '',
    image_url: raw.image_url ?? '',
    tags: [],
    capacity: '',
    selected: true,
    expanded: false,
    status: 'pending',
  }
}

export default function AiImportPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  const [inputType, setInputType] = useState<InputType>('url')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [fileData, setFileData] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [drafts, setDrafts] = useState<EventDraft[]>([])
  const [registering, setRegistering] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoading) return
    if (!currentUser || currentUser.role !== 'admin') router.replace('/')
  }, [currentUser, isLoading, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setMimeType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setFileData(base64)
      if (file.type.startsWith('image/')) {
        setFilePreview(result)
      } else {
        setFilePreview(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleExtract = async () => {
    setExtracting(true)
    setDrafts([])
    try {
      const payload: Record<string, string> = { input_type: inputType }
      if (inputType === 'url') payload.url = urlInput
      if (inputType === 'text') payload.text = textInput
      if (inputType === 'image') {
        if (!fileData) { toast.error('画像を選択してください'); return }
        payload.image_data = fileData
        payload.mime_type = mimeType
      }
      if (inputType === 'pdf') {
        if (!fileData) { toast.error('PDFを選択してください'); return }
        payload.pdf_data = fileData
      }

      const res = await apiClient.post('/api/v1/admin/ai_import/extract', payload)
      const events: Record<string, string | null>[] = res.data.events ?? []

      if (events.length === 0) {
        toast.error('イベント情報が見つかりませんでした')
        return
      }

      setDrafts(events.map(rawToEventDraft))
      toast.success(`${events.length}件のイベント情報を抽出しました`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(message ?? '抽出に失敗しました')
    } finally {
      setExtracting(false)
    }
  }

  const updateDraft = (index: number, field: keyof EventDraft, value: unknown) => {
    setDrafts(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const toggleTag = (index: number, tag: string) => {
    setDrafts(prev => prev.map((d, i) => {
      if (i !== index) return d
      const tags = d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag]
      return { ...d, tags }
    }))
  }

  const selectedDrafts = drafts.filter(d => d.selected && d.status === 'pending')

  const handleBulkRegister = async () => {
    if (selectedDrafts.length === 0) {
      toast.error('登録するイベントを選択してください')
      return
    }
    setRegistering(true)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i]
      if (!draft.selected || draft.status !== 'pending') continue

      try {
        await apiClient.post('/api/v1/admin/events', {
          event: {
            title: draft.title,
            description: draft.description,
            location: draft.location,
            area: draft.area,
            category: draft.category,
            start_at: draft.start_at || null,
            end_at: draft.end_at || null,
            event_url: draft.event_url || null,
            image_url: draft.image_url || null,
            capacity: draft.capacity ? parseInt(draft.capacity) : null,
            tags: draft.tags,
            source: 'manual',
          },
        })
        updateDraft(i, 'status', 'success')
        successCount++
      } catch {
        updateDraft(i, 'status', 'error')
        updateDraft(i, 'errorMessage', '登録に失敗しました')
        errorCount++
      }
    }

    setRegistering(false)
    if (successCount > 0) toast.success(`${successCount}件を登録しました`)
    if (errorCount > 0) toast.error(`${errorCount}件の登録に失敗しました`)
  }

  if (isLoading || !currentUser) return null

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const inputTabs: { type: InputType; label: string; Icon: typeof Link2; accept?: string }[] = [
    { type: 'url', label: 'URLから', Icon: Link2 },
    { type: 'text', label: 'テキストから', Icon: FileText },
    { type: 'image', label: '画像・スクショ', Icon: ImageIcon, accept: 'image/jpeg,image/png,image/webp' },
    { type: 'pdf', label: 'PDFから', Icon: FileType, accept: 'application/pdf' },
  ]

  const successCount = drafts.filter(d => d.status === 'success').length

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin</h1>
        <AdminNav />

        {/* 入力エリア */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-purple-500" />
            <h2 className="text-base font-semibold text-gray-800">AIでイベント情報を抽出</h2>
          </div>

          {/* 入力タイプタブ */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {inputTabs.map(({ type, label, Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => { setInputType(type); setFileData(null); setFilePreview(null); setFileName(null) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  inputType === type
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* URL入力 */}
          {inputType === 'url' && (
            <div>
              <label className={labelClass}>イベントページのURL（複数イベントが掲載されたページも可）</label>
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/events/"
                className={inputClass}
              />
            </div>
          )}

          {/* テキスト入力 */}
          {inputType === 'text' && (
            <div>
              <label className={labelClass}>イベント情報のテキスト（複数イベントをまとめて貼り付け可）</label>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                rows={8}
                placeholder={'チラシの文字起こし・SNS投稿・CSVなどを貼り付けてください\n複数イベントがある場合はまとめて貼り付けるとまとめて抽出できます'}
                className={inputClass}
              />
            </div>
          )}

          {/* 画像・PDF アップロード */}
          {(inputType === 'image' || inputType === 'pdf') && (
            <div>
              <label className={labelClass}>
                {inputType === 'image' ? 'スクリーンショット・チラシ画像（複数イベント掲載も可）' : 'PDFファイル（複数イベント掲載も可）'}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                {filePreview ? (
                  <img src={filePreview} alt="アップロード画像のプレビュー" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : fileName ? (
                  <div className="text-gray-600">
                    <FileType size={32} className="mx-auto mb-2 text-purple-400" aria-hidden="true" />
                    <p className="text-sm font-medium">{fileName}</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {inputType === 'image'
                      ? <ImageIcon size={32} className="mx-auto mb-2" aria-hidden="true" />
                      : <FileType size={32} className="mx-auto mb-2" aria-hidden="true" />
                    }
                    <p className="text-sm">クリックしてファイルを選択</p>
                    <p className="text-xs mt-1">
                      {inputType === 'image' ? 'JPG / PNG / WebP 対応' : 'PDF 対応'}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={inputTabs.find(t => t.type === inputType)?.accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleExtract}
            disabled={extracting}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {extracting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AIが解析中...（複数イベントを自動検出します）
              </>
            ) : (
              <>
                <Sparkles size={16} />
                AIで抽出する
              </>
            )}
          </button>
        </div>

        {/* 抽出結果 */}
        {drafts.length > 0 && (
          <div>
            {/* 一括操作バー */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{drafts.length}件</span>抽出
                {successCount > 0 && <span className="ml-2 text-emerald-600">（{successCount}件登録済み）</span>}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drafts.filter(d => d.status === 'pending').every(d => d.selected)}
                    onChange={e => setDrafts(prev => prev.map(d => d.status === 'pending' ? { ...d, selected: e.target.checked } : d))}
                    className="w-4 h-4 accent-purple-600"
                  />
                  全選択
                </label>
                <button
                  type="button"
                  onClick={handleBulkRegister}
                  disabled={registering || selectedDrafts.length === 0}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {registering ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {registering ? '登録中...' : `選択した ${selectedDrafts.length} 件を登録`}
                </button>
              </div>
            </div>

            {/* イベントカード一覧 */}
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                    draft.status === 'success' ? 'border-emerald-200 bg-emerald-50/30' :
                    draft.status === 'error' ? 'border-red-200 bg-red-50/30' :
                    draft.selected ? 'border-purple-200' : 'border-gray-200'
                  }`}
                >
                  {/* カードヘッダー */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {draft.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={draft.selected}
                        onChange={e => updateDraft(index, 'selected', e.target.checked)}
                        className="w-4 h-4 accent-purple-600 shrink-0"
                      />
                    )}
                    {draft.status === 'success' && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                    {draft.status === 'error' && <XCircle size={16} className="text-red-500 shrink-0" />}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {draft.title || '（タイトル未取得）'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {draft.area} · {draft.category}
                        {draft.start_at && ` · ${new Date(draft.start_at).toLocaleDateString('ja-JP')}`}
                      </p>
                    </div>

                    {draft.status === 'success' && (
                      <span className="text-xs text-emerald-600 font-medium shrink-0">登録済み</span>
                    )}
                    {draft.status === 'error' && (
                      <span className="text-xs text-red-600 font-medium shrink-0">失敗</span>
                    )}

                    {draft.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateDraft(index, 'expanded', !draft.expanded)}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        {draft.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>

                  {/* 展開時の編集フォーム */}
                  {draft.expanded && draft.status === 'pending' && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                      <div>
                        <label className={labelClass}>タイトル</label>
                        <input value={draft.title} onChange={e => updateDraft(index, 'title', e.target.value)} className={inputClass} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>エリア</label>
                          <select value={draft.area} onChange={e => updateDraft(index, 'area', e.target.value)} className={inputClass}>
                            {AREAS.map(a => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>カテゴリ</label>
                          <select value={draft.category} onChange={e => updateDraft(index, 'category', e.target.value)} className={inputClass}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>開始日時</label>
                          <input type="datetime-local" value={draft.start_at} onChange={e => updateDraft(index, 'start_at', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>終了日時</label>
                          <input type="datetime-local" value={draft.end_at} onChange={e => updateDraft(index, 'end_at', e.target.value)} className={inputClass} />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>場所</label>
                        <input value={draft.location} onChange={e => updateDraft(index, 'location', e.target.value)} className={inputClass} />
                      </div>

                      <div>
                        <label className={labelClass}>説明</label>
                        <textarea value={draft.description} onChange={e => updateDraft(index, 'description', e.target.value)} rows={3} className={inputClass} />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>イベントURL</label>
                          <input value={draft.event_url} onChange={e => updateDraft(index, 'event_url', e.target.value)} className={inputClass} placeholder="https://..." />
                        </div>
                        <div>
                          <label className={labelClass}>画像URL</label>
                          <input value={draft.image_url} onChange={e => updateDraft(index, 'image_url', e.target.value)} className={inputClass} placeholder="https://..." />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>タグ</label>
                        <div className="flex gap-2 flex-wrap mt-1">
                          {TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(index, tag)}
                              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                draft.tags.includes(tag)
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* まだ抽出前の案内 */}
        {drafts.length === 0 && !extracting && (
          <div className="text-center py-8 text-gray-400 text-sm">
            <Sparkles size={32} className="mx-auto mb-2 text-purple-300" />
            <p>URL・テキスト・画像・PDFから複数イベントをまとめて抽出・登録できます</p>
          </div>
        )}
      </div>
    </div>
  )
}
