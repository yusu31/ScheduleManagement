'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!currentUser || currentUser.role !== 'admin') {
      router.replace('/')
      return
    }
    router.replace('/admin/events')
  }, [currentUser, isLoading, router])

  return null
}
