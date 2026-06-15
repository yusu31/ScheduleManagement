'use client'

import { useState, useCallback, useEffect } from 'react'
import apiClient from '@/lib/axios'

type ConquestEntry = {
  id: number
  region_id: string
  conquered_at: string
}

export function useConquerCollection() {
  const [conquests, setConquests] = useState<ConquestEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiClient.get<ConquestEntry[]>('/api/v1/region_conquests')
      .then((res) => setConquests(Array.isArray(res.data) ? res.data : []))
      .catch(() => setConquests([]))
      .finally(() => setIsLoading(false))
  }, [])

  const addConquest = useCallback(async (regionId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<ConquestEntry>('/api/v1/region_conquests', {
        region_conquest: {
          region_id: regionId,
          conquered_at: new Date().toISOString(),
        },
      })
      setConquests((prev) => {
        const exists = prev.some((c) => c.region_id === regionId)
        return exists ? prev : [...prev, res.data]
      })
      return true
    } catch {
      return false
    }
  }, [])

  const hasConquered = useCallback(
    (regionId: string) => conquests.some((c) => c.region_id === regionId),
    [conquests]
  )

  return { conquests, isLoading, addConquest, hasConquered }
}
