'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

type SettingsChange = {
  feePercentage: number
  updatedAt: string | null
}

interface AccountRealtimeProps {
  profileUserId?: string
  onSettingsChange?: (settings: SettingsChange) => void
}

export function AccountRealtime({ profileUserId, onSettingsChange }: AccountRealtimeProps) {
  const supabaseConfigured = isSupabaseConfigured()
  const router = useRouter()
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured])

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      return
    }

    const channel = supabase.channel('account-data-realtime')

    if (profileUserId) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { id?: string } | undefined

          if (row?.id !== profileUserId) {
            return
          }

          router.refresh()
        },
      )
    }

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'platform_settings' },
      (payload) => {
        const row = (payload.new ?? payload.old) as
          | {
              id?: number
              fee_percentage?: number | null
              updated_at?: string | null
            }
          | undefined

        if (row?.id !== 1 || typeof row.fee_percentage !== 'number') {
          return
        }

        onSettingsChange?.({
          feePercentage: row.fee_percentage,
          updatedAt: row.updated_at ?? null,
        })
      },
    )

    const subscription = channel.subscribe()

    return () => {
      void supabase.removeChannel(subscription)
    }
  }, [onSettingsChange, profileUserId, router, supabase, supabaseConfigured])

  return null
}
