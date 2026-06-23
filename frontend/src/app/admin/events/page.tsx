'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Trash2, Pencil, Plus, Clock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'

const SOURCE_LABELS: Record<string, string> = {
  connpass: 'Connpass',
  rss: 'RSS',
  manual: '手動',
}

const SOURCE_COLORS: Record<string, string> = {
  connpass: 'bg-blue-100 text-blue-700',
  rss: 'bg-green-100 text-green-700',
  manual: 'bg-purple-100 text-purple-700',
}

export default function AdminEventsPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [fetching, setFetching] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'published'>('all')
  const [pendingCount, setPendingCount] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkApproving, setBulkApproving] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/')
    }
  }, [currentUser, isLoading, router])

  const fetchEvents = useCallback(async () => {
    setFetching(true)
    setSelectedIds(new Set())
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const res = await apiClient.get('/api/v1/admin/events', { params })
      setEvents(res.data)

      if (statusFilter !== 'pending') {
        const pendingRes = await apiClient.get('/api/v1/admin/events', { params: { status: 'pending' } })
        setPendingCount(pendingRes.data.length)
      } else {
        setPendingCount(res.data.length)
      }
    } catch {
      toast.error('イベントの取得に失敗しました')
    } finally {
      setFetching(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (!isLoading && currentUser?.role === 'admin') {
      fetchEvents()
    }
  }, [fetchEvents, isLoading, currentUser])

  const handleApprove = async (id: number) => {
    try {
      await apiClient.patch(`/api/v1/admin/events/${id}/approve`)
      toast.success('公開しました')
      fetchEvents()
    } catch {
      toast.error('公開に失敗しました')
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return
    try {
      await apiClient.delete(`/api/v1/admin/events/${id}`)
      toast.success('削除しました')
      fetchEvents()
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  // チェックボックスの切り替え（1件）
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 承認待ちを全選択 / 全解除
  const pendingEvents = events.filter(e => e.status === 'pending')
  const allPendingSelected = pendingEvents.length > 0 && pendingEvents.every(e => selectedIds.has(e.id))

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pendingEvents.map(e => e.id)))
    }
  }

  // 選択した件数を一括承認
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`選択した ${selectedIds.size} 件を承認して公開しますか？`)) return
    setBulkApproving(true)
    try {
      const res = await apiClient.post('/api/v1/admin/events/bulk_approve', {
        event_ids: Array.from(selectedIds),
      })
      toast.success(`${res.data.approved_count} 件を公開しました`)
      fetchEvents()
    } catch {
      toast.error('一括承認に失敗しました')
    } finally {
      setBulkApproving(false)
    }
  }

  if (isLoading || !currentUser) return null

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
            {pendingCount > 0 && (
              <p className="text-sm text-amber-600 mt-1 font-medium">
                ⏳ 承認待ち: {pendingCount}件
              </p>
            )}
          </div>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            イベントを追加
          </Link>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'published'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'すべて' : s === 'pending' ? '承認待ち' : '公開中'}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 一括承認バー（承認待ちが1件以上あるとき表示） */}
        {pendingEvents.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4">
            <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPendingSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-amber-500"
              />
              承認待ち {pendingEvents.length} 件を全選択
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {bulkApproving ? '処理中...' : `選択した ${selectedIds.size} 件を承認`}
              </button>
            )}
          </div>
        )}

        {/* イベント一覧 */}
        {fetching ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">イベントがありません</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8" />
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">タイトル</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">日付</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">エリア</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">ソース</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">状態</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(event.id) ? 'bg-amber-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {event.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(event.id)}
                          onChange={() => toggleSelect(event.id)}
                          className="w-4 h-4 accent-amber-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{event.category}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(event.start_at).toLocaleDateString('ja-JP', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{event.area}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[event.source] ?? 'bg-gray-100 text-gray-600'}`}>
                        <Globe size={10} />
                        {SOURCE_LABELS[event.source] ?? event.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {event.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          <Clock size={10} />
                          承認待ち
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle size={10} />
                          公開中
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {event.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                          >
                            <CheckCircle size={12} />
                            承認
                          </button>
                        )}
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Pencil size={12} />
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors font-medium"
                        >
                          <Trash2 size={12} />
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
