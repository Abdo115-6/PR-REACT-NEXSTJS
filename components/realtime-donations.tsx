'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { useToast } from '@/hooks/use-toast'

interface RealtimeDonationsProps {
  showToast?: boolean
  refreshOnChange?: boolean
  onChange?: () => void
}

export function RealtimeDonations({
  showToast = true,
  refreshOnChange = false,
  onChange,
}: RealtimeDonationsProps) {
  const supabaseConfigured = isSupabaseConfigured()
  const router = useRouter()
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured])
  const { toast } = useToast()

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      return
    }

    const handleMutation = () => {
      if (refreshOnChange) {
        router.refresh()
      }

      onChange?.()
    }

    const channel = supabase
      .channel('donations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          const donation = payload.new as
            | {
                amount?: string | number
                anonymous?: boolean
                donor_name?: string | null
                message?: string | null
              }
            | undefined

          if (showToast && donation) {
            const amount = Number.parseFloat(String(donation.amount || '0'))
            const name = donation.anonymous ? 'Someone' : donation.donor_name || 'A donor'

            toast({
              title: `New donation: MAD ${amount.toLocaleString()}`,
              description: donation.message
                ? `"${donation.message.slice(0, 80)}${donation.message.length > 80 ? '...' : ''}"`
                : `${name} supported a campaign. Thank you for your generosity!`,
              duration: 6000,
            })
          }

          handleMutation()
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'donations' }, handleMutation)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'donations' }, handleMutation)
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onChange, refreshOnChange, router, showToast, supabase, supabaseConfigured, toast])

  return null
}
