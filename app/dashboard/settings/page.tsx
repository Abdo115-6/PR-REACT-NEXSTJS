'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RealtimeDonations } from '@/components/realtime-donations'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { DollarSign, Percent, ShieldCheck } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'
import { formatDistanceToNow } from 'date-fns'
import { AccountRealtime } from '@/components/account-realtime'

const DEFAULT_FEE_PERCENTAGE = 5

export default function SettingsPage() {
  const supabaseConfigured = isSupabaseConfigured()
  const { toast } = useToast()
  const router = useRouter()
  const [feePercentage, setFeePercentage] = useState(DEFAULT_FEE_PERCENTAGE)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshNonce, setRefreshNonce] = useState(0)

  useEffect(() => {
    let active = true

    const loadSettings = async () => {
      if (!supabaseConfigured) {
        if (active) {
          router.push('/auth/login')
        }
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (active) {
          router.push('/auth/login')
        }
        return
      }

      const { data: settings } = await supabase
        .from('platform_settings')
        .select('fee_percentage, updated_at')
        .eq('id', 1)
        .maybeSingle()

      if (!active) {
        return
      }

      if (settings) {
        setFeePercentage(settings.fee_percentage)
        setUpdatedAt(settings.updated_at ?? null)
      }
      setLoading(false)
    }

    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void loadSettings()
      }
    }

    void loadSettings()
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      active = false
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [router, supabaseConfigured])

  const handleSave = async () => {
    if (!supabaseConfigured) return

    const supabase = createClient()
    setSaving(true)
    try {
      const nextUpdatedAt = new Date().toISOString()
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ id: 1, fee_percentage: feePercentage, updated_at: nextUpdatedAt }, { onConflict: 'id' })

      if (error) throw error

      setUpdatedAt(nextUpdatedAt)

      toast({
        title: 'Settings saved',
        description: `Platform fee set to ${feePercentage}%`,
      })
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to save settings'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <RealtimeDonations
        showToast={false}
        refreshOnChange
        onChange={() => setRefreshNonce((value) => value + 1)}
      />
      <AccountRealtime
        onSettingsChange={({ feePercentage: nextFeePercentage, updatedAt: nextSettingsUpdatedAt }) => {
          setFeePercentage(nextFeePercentage)
          setUpdatedAt(nextSettingsUpdatedAt)
        }}
      />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your platform configuration</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  <CardTitle>Platform Fee</CardTitle>
                </div>
                <CardDescription>
                  Configure the percentage fee charged on each donation. This is your platform&apos;s revenue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="feePercentage">Fee Percentage (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="feePercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="0.5"
                      value={feePercentage}
                      onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Percent className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 5%. For example, a MAD 100 donation means MAD {(100 * feePercentage / 100).toFixed(2)} goes to the platform.
                  </p>
                  {updatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <CardTitle>Revenue Summary</CardTitle>
                </div>
                <CardDescription>
                  Overview of your platform&apos;s earnings from the fee system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueSummary key={refreshNonce} refreshNonce={refreshNonce} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About Platform Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The platform fee is a small percentage of each donation that helps cover operating costs
                  and supports the continued development of the platform.
                </p>
                <Separator />
                <div className="space-y-1">
                  <p><strong>Current Fee:</strong> {feePercentage}% per donation</p>
                  <p><strong>Donor Visibility:</strong> Donors see the fee breakdown before completing their donation</p>
                  <p><strong>Payout to Campaign:</strong> Donation amount minus platform fee</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}

function RevenueSummary({ refreshNonce }: { refreshNonce: number }) {
  const supabaseConfigured = isSupabaseConfigured()
  const [totalFees, setTotalFees] = useState(0)
  const [totalDonations, setTotalDonations] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadRevenue = async () => {
      if (!supabaseConfigured) {
        if (active) {
          setLoading(false)
        }
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (active) {
          setLoading(false)
        }
        return
      }

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id)

      if (!campaigns || campaigns.length === 0) {
        if (active) {
          setTotalFees(0)
          setTotalDonations(0)
          setLoading(false)
        }
        return
      }

      const { data: donations } = await supabase
        .from('donations')
        .select('amount, platform_fee')
        .in('campaign_id', campaigns.map((campaign) => campaign.id))

      if (donations && active) {
        setTotalFees(donations.reduce((sum, donation) => sum + parseFloat(donation.platform_fee || '0'), 0))
        setTotalDonations(donations.reduce((sum, donation) => sum + parseFloat(donation.amount || '0'), 0))
      }
      if (active) {
        setLoading(false)
      }
    }
    loadRevenue()
    return () => {
      active = false
    }
  }, [refreshNonce, supabaseConfigured])

  if (loading) return <p className="text-muted-foreground">Loading revenue data...</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
        <p className="text-sm text-muted-foreground">Platform Revenue</p>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">MAD {totalFees.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <p className="text-sm text-muted-foreground">Total Donations</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">MAD {totalDonations.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
        <p className="text-sm text-muted-foreground">Effective Rate</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          {totalDonations > 0 ? ((totalFees / totalDonations) * 100).toFixed(1) : '0'}%
        </p>
      </div>
    </div>
  )
}
