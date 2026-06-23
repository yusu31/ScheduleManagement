'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { Event } from '@/types/event'
import EventForm from '../../EventForm'

export default function EditEventPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/')
      return
    }
    apiClient.get(`/api/v1/admin/events/${params.id}`)
      .then(res => setEvent(res.data))
      .catch(() => router.replace('/admin/events'))
  }, [currentUser, isLoading, router, params.id])

  if (isLoading || !currentUser || !event) return null

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          イベント一覧に戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">イベントを編集</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <EventForm event={event} />
        </div>
      </div>
    </div>
  )
}
