'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import EventForm from '../EventForm'

export default function NewEventPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!currentUser || currentUser.role !== 'admin') router.replace('/')
  }, [currentUser, isLoading, router])

  if (isLoading || !currentUser) return null

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          イベント一覧に戻る
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">イベントを追加</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <EventForm />
        </div>
      </div>
    </div>
  )
}
