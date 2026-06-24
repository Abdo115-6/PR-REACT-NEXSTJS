import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DashboardCharts } from '@/components/dashboard-charts'
import { CampaignCard } from '@/components/campaign-card'
import { RealtimeDonations } from '@/components/realtime-donations'
import { BarChart3, DollarSign, Heart, Target, TrendingUp, Users } from 'lucide-react'

function toNumber(value: string | number | null | undefined) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect('/auth/login')

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: donationsByUser } = await supabase
    .from('donations')
    .select('*')
    .eq('donor_id', user.id)
    .order('created_at', { ascending: true })

  const { data: donationsByEmail } = user.email
    ? await supabase
        .from('donations')
        .select('*')
        .eq('donor_email', user.email)
        .order('created_at', { ascending: true })
    : { data: [] }

  const donations = Array.from(
    new Map([...(donationsByUser || []), ...(donationsByEmail || [])].map((donation) => [donation.id, donation])).values()
  )
  const donatedCampaignIds = Array.from(new Set(donations.map((donation) => donation.campaign_id)))

  const { data: donatedCampaigns } = donatedCampaignIds.length > 0
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('id', donatedCampaignIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
    : { data: [] }

  const activeCampaigns = donatedCampaigns || []
  const activeCampaignIds = activeCampaigns.map((campaign) => campaign.id)
  const { data: campaignDonations } = activeCampaignIds.length > 0
    ? await supabase
        .from('donations')
        .select('campaign_id, amount, platform_fee, donor_id, donor_email, donor_name')
        .in('campaign_id', activeCampaignIds)
    : { data: [] }

  const campaignDonationsList = campaignDonations || []
  const campaignDonationCounts = new Map<string, number>()
  const uniqueDonors = new Set<string>()
  campaignDonationsList.forEach((donation) => {
    campaignDonationCounts.set(
      donation.campaign_id,
      (campaignDonationCounts.get(donation.campaign_id) || 0) + 1
    )
    uniqueDonors.add(
      donation.donor_id ||
      donation.donor_email ||
      donation.donor_name ||
      `anonymous-${donation.campaign_id}`
    )
  })

  const totalDonations = donations.length
  const totalRaised = donations.reduce((sum, donation) => sum + toNumber(donation.amount), 0)
  const totalPlatformFees = donations.reduce((sum, donation) => sum + toNumber(donation.platform_fee), 0)
  const donationsOverTimeMap = new Map<string, { amount: number; count: number }>()

  donations.forEach((donation) => {
    const date = donation.created_at?.split('T')[0]
    if (!date) return

    const existing = donationsOverTimeMap.get(date) || { amount: 0, count: 0 }
    existing.amount += toNumber(donation.amount)
    existing.count += 1
    donationsOverTimeMap.set(date, existing)
  })

  const campaignPerformance = activeCampaigns.map((campaign) => ({
    name: campaign.title,
    raised: toNumber(campaign.current_amount),
    goal: toNumber(campaign.goal_amount),
    donations: campaignDonationCounts.get(campaign.id) || 0,
  }))

  const donationsOverTime = Array.from(donationsOverTimeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }))

  const netRevenue = totalRaised - totalPlatformFees
  const revenueBreakdown = totalRaised > 0 ? [
    { name: 'Donations After Fees', value: netRevenue, color: '#3b82f6' },
    { name: 'Platform Fees', value: totalPlatformFees, color: '#f59e0b' },
  ] : []

  const stats = {
    activeCampaigns: activeCampaigns.length,
    totalRaised,
    totalDonations,
    uniqueDonors: uniqueDonors.size,
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
              <p className="text-muted-foreground mt-2">Track your donations and the active campaigns you support.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/donations">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Donations
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              { title: 'Active Campaigns', value: stats.activeCampaigns, icon: Target, color: 'bg-sky-100 dark:bg-sky-950/50', textColor: 'text-sky-700 dark:text-sky-300' },
              { title: 'Total Raised', value: `MAD ${stats.totalRaised.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-100 dark:bg-green-950/50', textColor: 'text-green-700 dark:text-green-300' },
              { title: 'Total Donations', value: stats.totalDonations, icon: Heart, color: 'bg-red-100 dark:bg-red-950/50', textColor: 'text-red-700 dark:text-red-300' },
              { title: 'Unique Donors', value: stats.uniqueDonors, icon: Users, color: 'bg-violet-100 dark:bg-violet-950/50', textColor: 'text-violet-700 dark:text-violet-300' },
              { title: 'Platform Revenue', value: `MAD ${stats.platformRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-100 dark:bg-amber-950/50', textColor: 'text-amber-700 dark:text-amber-300' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`rounded-lg p-2 ${stat.color}`}>
                        <Icon className={`h-4 w-4 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Charts */}
          <div className="mt-8">
            <DashboardCharts data={chartData} />
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Active Campaigns You Donated To</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These are active campaigns connected to donations made by your account.
              </p>
            </div>
            {activeCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    description={campaign.description || ''}
                    goalAmount={toNumber(campaign.goal_amount)}
                    currentAmount={toNumber(campaign.current_amount)}
                    category={campaign.category || 'General'}
                    donorCount={campaignDonationCounts.get(campaign.id) || 0}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">You have not donated to any active campaigns yet.</p>
                  <Link href="/campaigns" className="mt-4 inline-block">
                    <Button>Browse Campaigns</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

        {/* Realtime Donation Notifications */}
        <RealtimeDonations />
        </div>
      </main>
    </>
  )
}
