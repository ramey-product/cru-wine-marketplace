'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/lib/order-tracking/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatusEvent {
  id: string
  status: string
  changed_by: string | null
  notes: string | null
  created_at: string
}

interface UseOrderStatusResult {
  /** Current order status */
  currentStatus: OrderStatus
  /** Full status history (most recent first) */
  statusHistory: StatusEvent[]
  /** Whether connected via Realtime (false = polling fallback) */
  isRealtime: boolean
  /** Last time status was checked/updated */
  lastUpdated: Date
  /** Error message if subscription or polling failed */
  error: string | null
}

interface UseOrderStatusOptions {
  /** Initial status from server render */
  initialStatus: OrderStatus
  /** Initial status history from server render */
  initialHistory: StatusEvent[]
  /** Polling interval in ms when Realtime fails (default: 15000) */
  pollingInterval?: number
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Subscribe to real-time order status updates via Supabase Realtime.
 * Falls back to polling if the Realtime channel fails.
 */
// Whether Supabase is configured (checked once at module level)
const HAS_SUPABASE =
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function useOrderStatus(
  orderId: string,
  options: UseOrderStatusOptions
): UseOrderStatusResult {
  const {
    initialStatus,
    initialHistory,
    pollingInterval = 15_000,
  } = options

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus)
  const [statusHistory, setStatusHistory] = useState<StatusEvent[]>(initialHistory)
  const [isRealtime, setIsRealtime] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  // ---- Handle new status event (from Realtime or polling) ----
  const handleNewStatus = useCallback((event: StatusEvent) => {
    if (!mountedRef.current) return

    setCurrentStatus(event.status as OrderStatus)
    setStatusHistory((prev) => {
      // Avoid duplicates
      if (prev.some((e) => e.id === event.id)) return prev
      return [event, ...prev]
    })
    setLastUpdated(new Date())
    setError(null)
  }, [])

  // ---- Polling fallback ----
  const startPolling = useCallback(() => {
    if (pollingRef.current || !HAS_SUPABASE) return

    pollingRef.current = setInterval(async () => {
      if (!mountedRef.current) return

      try {
        const supabase = createClient()
        const { data, error: queryError } = await supabase
          .from('orders')
          .select('id, status, updated_at')
          .eq('id', orderId)
          .single()

        if (queryError) {
          console.error('Order status polling failed:', queryError)
          return
        }

        if (data && data.status !== currentStatus) {
          // Fetch the latest history entry
          const { data: historyData } = await supabase
            .from('order_status_history')
            .select('id, status, changed_by, notes, created_at')
            .eq('order_id', orderId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (historyData) {
            handleNewStatus(historyData)
          } else {
            setCurrentStatus(data.status as OrderStatus)
            setLastUpdated(new Date())
          }
        }
      } catch (err) {
        console.error('Order status polling error:', err)
      }
    }, pollingInterval)
  }, [orderId, currentStatus, pollingInterval, handleNewStatus])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // ---- Realtime subscription ----
  useEffect(() => {
    mountedRef.current = true

    // Skip Realtime when Supabase isn't configured (local dev with mock data)
    if (!HAS_SUPABASE) {
      return () => {
        mountedRef.current = false
      }
    }

    const supabase = createClient()

    function subscribe() {
      const channel = supabase
        .channel(`order-tracking-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'order_status_history',
            filter: `order_id=eq.${orderId}`,
          },
          (payload) => {
            const event = payload.new as StatusEvent
            handleNewStatus(event)
          }
        )
        .subscribe((status) => {
          if (!mountedRef.current) return

          if (status === 'SUBSCRIBED') {
            setIsRealtime(true)
            setError(null)
            retryCountRef.current = 0
            stopPolling()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsRealtime(false)
            setError('Real-time connection lost. Using polling fallback.')
            startPolling()

            // Exponential backoff reconnect
            const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000)
            retryCountRef.current++

            setTimeout(() => {
              if (!mountedRef.current) return
              channel.unsubscribe()
              subscribe()
            }, delay)
          }
        })

      channelRef.current = channel
    }

    subscribe()

    return () => {
      mountedRef.current = false
      stopPolling()
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [orderId, handleNewStatus, startPolling, stopPolling])

  return {
    currentStatus,
    statusHistory,
    isRealtime,
    lastUpdated,
    error,
  }
}
