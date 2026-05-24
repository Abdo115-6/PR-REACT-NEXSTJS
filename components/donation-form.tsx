'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Info, UserCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const PLATFORM_FEE_PERCENTAGE = 5

interface DonationFormProps {
  campaignId: string
}

export function DonationForm({ campaignId }: DonationFormProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    email: '',
    message: '',
    anonymous: false,
  })

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser({ id: user.id, email: user.email })
        setFormData(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          donorName: prev.donorName || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        }))
      }
    }
    loadUser()
  }, [])

  const donationAmount = parseFloat(formData.amount) || 0
  const platformFee = donationAmount * (PLATFORM_FEE_PERCENTAGE / 100)
  const campaignReceives = donationAmount - platformFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (donationAmount <= 0) {
        throw new Error('Please enter a valid donation amount')
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error('Authentication error')
      }

      const donationData: Record<string, any> = {
        campaign_id: campaignId,
        donor_id: user?.id || null,
        amount: donationAmount,
        donor_name: formData.anonymous ? null : (formData.donorName || user?.user_metadata?.full_name || null),
        donor_email: formData.anonymous ? null : (formData.email || user?.email || null),
        message: formData.message || null,
        anonymous: formData.anonymous,
      }

      // Try with platform fee columns
      const { error: insertError } = await supabase.from('donations').insert({
        ...donationData,
        platform_fee: platformFee,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE,
      })

      if (insertError) {
        if (insertError.message?.includes('platform_fee') || insertError.code === '42703') {
          // Column doesn't exist - retry without fee columns
          donationData.platform_fee = platformFee
          const { error: retryError } = await supabase.from('donations').insert(donationData)
          if (retryError) throw retryError
        } else {
          throw insertError
        }
      }

      toast({
        title: 'Donation Successful! 🎉',
        description: `Thank you for donating MAD ${donationAmount.toLocaleString()}.`,
      })

      setFormData({
        amount: '',
        donorName: currentUser?.email?.split('@')[0] || '',
        email: currentUser?.email || '',
        message: '',
        anonymous: false,
      })

      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      console.error('Donation error:', error)
      toast({
        title: 'Donation Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-sm">
              <UserCheck className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Donating as</span>
              <span className="font-medium">{currentUser.email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">Not signed in</span>
              <Link href="/auth/login" className="text-primary underline ml-auto">Sign in</Link>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          {donationAmount > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Donation Amount</span>
                <span className="font-medium">MAD {donationAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)
                  <Info className="w-3 h-3" />
                </span>
                <span className="text-amber-600 dark:text-amber-400">-MAD {platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-1.5 flex justify-between font-semibold">
                <span>Campaign Receives</span>
                <span className="text-green-600">MAD {campaignReceives.toFixed(2)}</span>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              disabled={loading}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
              Donate anonymously
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Processing...' : `Donate MAD ${donationAmount.toFixed(2) || '—'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
