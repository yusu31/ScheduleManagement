'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'

const AREAS = [
  '郡山市', '福島市', 'いわき市', '白河市', '須賀川市', '喜多方市',
  '相馬市', '二本松市', '田村市', '南相馬市', '伊達市', '本宮市', 'その他',
]
const CATEGORIES = [
  'スポーツ', '音楽', 'アート', '食・グルメ', '自然・アウトドア',
  '文化・伝統', 'ファミリー', 'テクノロジー', '教育', '祭り・イベント', 'その他',
]
const TAGS = ['子連れOK', '無料', '屋外', '室内']

type Props = {
  event?: Event
}

function toDatetimeLocal(iso: string | null | undefined) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

export default function EventForm({ event }: Props) {
  const router = useRouter()
  const isEdit = !!event

  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    location: event?.location ?? '',
    area: event?.area ?? AREAS[0],
    category: event?.category ?? CATEGORIES[0],
    start_at: toDatetimeLocal(event?.start_at),
    end_at: toDatetimeLocal(event?.end_at),
    capacity: event?.capacity?.toString() ?? '',
    event_url: event?.event_url ?? '',
    image_url: event?.image_url ?? '',
    tags: (event?.tags ?? []) as string[],
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        event: {
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : null,
          end_at: form.end_at || null,
        },
      }
      if (isEdit) {
        await apiClient.patch(`/api/v1/admin/events/${event.id}`, payload)
        toast.success('更新しました')
      } else {
        await apiClient.post('/api/v1/admin/events', payload)
        toast.success('作成しました')
      }
      router.push('/admin/events')
    } catch {
      toast.error(isEdit ? '更新に失敗しました' : '作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>タイトル <span className="text-red-500">*</span></label>
        <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="イベントタイトル" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>エリア <span className="text-red-500">*</span></label>
          <select name="area" value={form.area} onChange={handleChange} required className={inputClass}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>カテゴリ <span className="text-red-500">*</span></label>
          <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>開始日時 <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="start_at" value={form.start_at} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>終了日時</label>
          <input type="datetime-local" name="end_at" value={form.end_at} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>場所</label>
        <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="○○市 △△公園" />
      </div>

      <div>
        <label className={labelClass}>説明</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass} placeholder="イベントの詳細を入力" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>定員</label>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className={inputClass} placeholder="未定の場合は空欄" min={1} />
        </div>
        <div>
          <label className={labelClass}>イベントURL</label>
          <input name="event_url" value={form.event_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label className={labelClass}>画像URL</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className={labelClass}>タグ</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                form.tags.includes(tag)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
