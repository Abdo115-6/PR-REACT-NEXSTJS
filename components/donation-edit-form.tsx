'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { CalendarDays, CheckCircle2, Info, Loader2, Lock, User } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'
import { DEFAULT_PLATFORM_FEE_PERCENTAGE, getPlatformFeePercentage } from '@/lib/platform-settings'

interface DonationEditFormProps {
  donation: {
    id: string
    amount: string | number
    donor_name: string | null
    donor_email: string | null
    message: string | null
    anonymous: boolean
    created_at: string
  }
  campaignTitle: string
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : formatDistanceToNow(date, { addSuffix: true })
}

export function DonationEditForm({ donation, campaignTitle }: DonationEditFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [feePercentage, setFeePercentage] = useState(DEFAULT_PLATFORM_FEE_PERCENTAGE)
  const [formData, setFormData] = useState({
    amount: String(donation.amount ?? ''),
    donorName: donation.donor_name ?? '',
    message: donation.message ?? '',
    anonymous: donation.anonymous,
  })

  const donationAmount = Number(formData.amount) || 0
  const platformFee = Number((donationAmount * (feePercentage / 100)).toFixed(2))
  const campaignReceives = Number((donationAmount - platformFee).toFixed(2))

  useEffect(() => {
    const loadPlatformFee = async () => {
      const resolvedFee = await getPlatformFeePercentage(supabase)
      setFeePercentage(resolvedFee)
    }

    loadPlatformFee()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid donation amount.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.anonymous && !formData.donorName.trim()) {
      toast({
        title: 'Missing name',
        description: 'Please add a donor name when the donation is public.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const resolvedFeePercentage = await getPlatformFeePercentage(supabase)
      const resolvedPlatformFee = Number((donationAmount * (resolvedFeePercentage / 100)).toFixed(2))

      const { error } = await supabase
        .from('donations')
        .update({
          amount: donationAmount,
          donor_name: formData.donorName.trim() || null,
          message: formData.message.trim() || null,
          anonymous: formData.anonymous,
          platform_fee: resolvedPlatformFee,
          platform_fee_percentage: resolvedFeePercentage,
        })
        .eq('id', donation.id)

      if (error) throw error

      toast({
        title: 'Donation updated',
        description: 'The donation details have been saved.',
      })

      router.replace('/dashboard/donations')
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update donation'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Edit Donation</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the amount, visibility, name, or message for this donation.
            </p>
          </div>
          <div className="rounded-full bg-sky-50 p-2 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{campaignTitle}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
            <span>Created {formatRelativeDate(donation.created_at)}</span>
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4" />
              {donation.donor_email || 'No email saved'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              min="1"
              placeholder="MAD 0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={loading}
              required
              className="h-12 text-lg font-semibold"
            />
          </div>

          {donationAmount > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="mb-3 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Updated donation summary
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation Amount</span>
                  <span className="font-medium">MAD {donationAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Platform Fee ({feePercentage}%)
                    <Info className="h-3 w-3" />
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">-MAD {platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Campaign Receives</span>
                  <span className="text-green-700 dark:text-green-300">MAD {campaignReceives.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Donor Name</label>
            <Input
              type="text"
              placeholder="Name shown on public campaign pages"
              value={formData.donorName}
              onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              disabled={loading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {formData.anonymous
                ? 'This name stays hidden on public pages while the donation is anonymous.'
                : 'A public donation needs a visible donor name.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <Textarea
              placeholder="Add or update a message for the campaign creator"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              disabled={loading}
              className="rounded"
            />
            <label htmlFor="anonymous" className="cursor-pointer text-sm font-medium">
              Keep this donation anonymous
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/dashboard/donations')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
