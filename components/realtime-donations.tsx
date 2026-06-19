'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function RealtimeDonations() {
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const channel = supabase
      .channel('donations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'donations' },
        (payload) => {
          const donation = payload.new
          const amount = parseFloat(donation.amount || '0')
          const name = donation.anonymous
            ? 'Someone'
            : donation.donor_name || 'A donor'

          toast({
            title: `New donation: MAD ${amount.toLocaleString()}`,
            description: donation.message
              ? `"${donation.message.slice(0, 80)}${donation.message.length > 80 ? '...' : ''}"`
              : `${name} supported a campaign. Thank you for your generosity!`,
            duration: 6000,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return null
}
