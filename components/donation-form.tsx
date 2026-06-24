'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, CheckCircle2, Info, Loader2, Lock, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/errors'
import { DEFAULT_PLATFORM_FEE_PERCENTAGE, getPlatformFeePercentage } from '@/lib/platform-settings'
import { resolveProfileSyncData } from '@/lib/profile-data'

interface DonationFormProps {
  campaignId: string
}

export function DonationForm({ campaignId }: DonationFormProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [feePercentage, setFeePercentage] = useState(DEFAULT_PLATFORM_FEE_PERCENTAGE)
  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    email: '',
    message: '',
    anonymous: false,
  })

  useEffect(() => {
    const loadUserAndFee = async () => {
      const [{ data: { user } }, platformFee] = await Promise.all([
        supabase.auth.getUser(),
        getPlatformFeePercentage(supabase),
      ])

      if (user) {
        setCurrentUser({ id: user.id, email: user.email })
        const profileData = resolveProfileSyncData(user)
        setFormData((prev) => ({
          ...prev,
          email: prev.email || user.email || '',
          donorName: prev.donorName || profileData.full_name || user.email?.split('@')[0] || '',
        }))
      }

      setFeePercentage(platformFee)
    }

    loadUserAndFee()
  }, [supabase])

  const donationAmount = parseFloat(formData.amount) || 0
  const platformFee = donationAmount * (feePercentage / 100)
  const campaignReceives = donationAmount - platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (donationAmount <= 0) {
        throw new Error('Please enter a valid donation amount')
      }

      const { data: { user } } = await supabase.auth.getUser()
      const profileData = user ? resolveProfileSyncData(user) : { full_name: null }

      const donationData = {
        campaign_id: campaignId,
        donor_id: user?.id || null,
        amount: donationAmount,
        donor_name: formData.anonymous
          ? null
          : (formData.donorName.trim() || profileData.full_name || null),
        donor_email: formData.anonymous ? null : (formData.email.trim() || user?.email || null),
        message: formData.message.trim() || null,
        anonymous: formData.anonymous,
        platform_fee: Number(platformFee.toFixed(2)),
        platform_fee_percentage: feePercentage,
      }

      const { error } = await supabase.from('donations').insert(donationData)

      if (error) {
        if (error.message?.includes('platform_fee') || error.code === '42703') {
          const fallbackRow = {
            campaign_id: donationData.campaign_id,
            donor_id: donationData.donor_id,
            amount: donationData.amount,
            donor_name: donationData.donor_name,
            donor_email: donationData.donor_email,
            message: donationData.message,
            anonymous: donationData.anonymous,
          }
          const { error: retryError } = await supabase.from('donations').insert(fallbackRow)
          if (retryError) throw retryError
        } else {
          throw error
        }
      }

      toast({
        title: 'Donation successful',
        description: `Thank you for donating MAD ${donationAmount.toLocaleString()}.`,
      })

      setFormData({
        amount: '',
        donorName: currentUser?.email?.split('@')[0] || '',
        email: currentUser?.email || '',
        message: '',
        anonymous: false,
      })

      router.refresh()
    } catch (error: unknown) {
      console.error('Donation error:', error)
      toast({
        title: 'Donation Failed',
        description: getErrorMessage(error, 'Something went wrong. Please try again.'),
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
            <CardTitle className="text-xl">Make a Donation</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Support this campaign securely in MAD.</p>
          </div>
          <div className="rounded-full bg-green-50 p-2 text-green-700 dark:bg-green-950/40 dark:text-green-300">
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 pt-6">
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-900 dark:bg-green-950/30">
              <UserCheck className="h-4 w-4 text-green-700 dark:text-green-300" />
              <span className="text-muted-foreground">Donating as</span>
              <span className="min-w-0 truncate font-medium">{currentUser.email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <span className="text-muted-foreground">Not signed in</span>
              <Link href="/auth/login" className="text-primary underline ml-auto">
                Sign in
              </Link>
            </div>
          )}

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
                Donation summary
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation Amount</span>
                  <span className="font-medium">MAD {donationAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Platform Fee ({feePercentage}%)
                    <Info className="w-3 h-3" />
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">-MAD {platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Campaign Receives</span>
                  <span className="text-green-700 dark:text-green-300">MAD {campaignReceives.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {!formData.anonymous && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <Textarea
              placeholder="Add a message to the campaign creator"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={loading}
              rows={3}
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
              Donate anonymously
            </label>
          </div>

          <Button type="submit" className="h-11 w-full bg-red-600 text-white hover:bg-red-700" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Processing...' : donationAmount > 0 ? `Donate MAD ${donationAmount.toFixed(2)}` : 'Enter an amount'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
