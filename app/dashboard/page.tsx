import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardStats } from '@/components/dashboard-stats'
import { DashboardCharts } from '@/components/dashboard-charts'
import { CampaignList } from '@/components/campaign-list'
import { ActivityFeed } from '@/components/activity-feed'
import { RealtimeDonations } from '@/components/realtime-donations'
import { Plus, BarChart3, Activity } from 'lucide-react'

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect('/auth/login')

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let totalDonations = 0
  let totalRaised = 0
  let totalDonors = new Set()
  let totalPlatformFees = 0
  const donationsOverTimeMap = new Map<string, { amount: number; count: number }>()
  const campaignPerformance: { name: string; raised: number; goal: number; donations: number }[] = []

  if (campaigns) {
    const donationData = await Promise.all(
      campaigns.map(async (campaign) => {
        const { data: donations, error: donationsError } = await supabase
          .from('donations')
          .select('amount, platform_fee, donor_id, created_at')
          .eq('campaign_id', campaign.id)
          .order('created_at', { ascending: true })

        if (donationsError) {
          console.error('Donations fetch error:', donationsError)
        }

        return { campaign, donations: donations || [] }
      })
    )

    donationData.forEach(({ campaign, donations }) => {
      let campaignRaised = 0
      donations.forEach((donation) => {
        totalDonations += 1
        const amount = parseFloat(donation.amount || 0)
        totalRaised += amount
        campaignRaised += amount
        totalPlatformFees += parseFloat(donation.platform_fee || '0')
        if (donation.donor_id) totalDonors.add(donation.donor_id)

        const date = donation.created_at?.split('T')[0]
        if (date) {
          const existing = donationsOverTimeMap.get(date) || { amount: 0, count: 0 }
          existing.amount += amount
          existing.count += 1
          donationsOverTimeMap.set(date, existing)
        }
      })

      campaignPerformance.push({
        name: campaign.title,
        raised: campaignRaised,
        goal: parseFloat(campaign.goal_amount),
        donations: donations.length,
      })
    })
  }

  const donationsOverTime = Array.from(donationsOverTimeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  // Revenue breakdown
  const netRevenue = totalRaised - totalPlatformFees
  const revenueBreakdown = totalRaised > 0 ? [
    { name: 'Campaign Revenue', value: netRevenue, color: '#3b82f6' },
    { name: 'Platform Fees', value: totalPlatformFees, color: '#f59e0b' },
  ] : []

  const stats = {
    totalCampaigns: campaigns?.length || 0,
    totalRaised,
    totalDonations,
    totalDonors: totalDonors.size,
    platformRevenue: totalPlatformFees,
  }

  const chartData = {
    donationsOverTime,
    campaignPerformance,
    revenueBreakdown,
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your campaigns, track donations, and view analytics</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/donations">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Donations
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats stats={stats} />

          {/* Charts */}
          <div className="mt-8">
            <DashboardCharts data={chartData} />
          </div>

          {/* Activity Feed & Campaigns */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-6">Your Campaigns</h2>
            {campaigns && campaigns.length > 0 ? (
              <CampaignList campaigns={campaigns} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven&apos;t created any campaigns yet.</p>
                  <Link href="/dashboard/create">
                    <Button>Create Your First Campaign</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="lg:col-span-1">
            <ActivityFeed userId={user.id} />
          </div>
        </div>

        {/* Realtime Donation Notifications */}
        <RealtimeDonations />
        </div>
      </main>
    </>
  )
}
