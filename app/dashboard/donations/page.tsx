import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import Navbar from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Heart, TrendingUp, Users, Wallet } from 'lucide-react'

interface Donation {
  id: string
  campaign_id: string
  donor_id: string | null
  amount: string
  platform_fee: string | null
  platform_fee_percentage: number | null
  donor_name: string | null
  donor_email: string | null
  message: string | null
  anonymous: boolean
  created_at: string
  campaign_title?: string
}

export default async function DonationsPage() {
  if (!isSupabaseConfigured()) redirect('/auth/login')

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const filters = [`donor_id.eq.${user.id}`]
  if (user.email) {
    filters.push(`donor_email.eq.${user.email}`)
  }

  const { data: donationsByAccount } = await supabase
    .from('donations')
    .select('*')
    .or(filters.join(','))
    .order('created_at', { ascending: false })

  const uniqueDonations = Array.from(
    new Map((donationsByAccount || []).map((donation) => [donation.id, donation])).values()
  )
  const campaignIds = Array.from(new Set(uniqueDonations.map((donation) => donation.campaign_id)))

  const { data: campaigns } = campaignIds.length > 0
    ? await supabase
        .from('campaigns')
        .select('id, title')
        .in('id', campaignIds)
    : { data: [] }

  const campaignMap = Object.fromEntries((campaigns || []).map((campaign) => [campaign.id, campaign.title]))

  const donationsWithCampaign: Donation[] = uniqueDonations.map(d => ({
    ...d,
    campaign_title: campaignMap[d.campaign_id] || 'Campaign unavailable',
  }))

  const totalDonations = donationsWithCampaign.length
  const totalDonated = donationsWithCampaign.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
  const totalFees = donationsWithCampaign.reduce((sum, d) => sum + parseFloat(d.platform_fee || '0'), 0)
  const supportedCampaigns = new Set(donationsWithCampaign.map(d => d.campaign_id)).size

  const stats = [
    { title: 'My Donations', value: totalDonations, icon: Heart, color: 'bg-red-50 dark:bg-red-950/40', textColor: 'text-red-700 dark:text-red-300' },
    { title: 'Total Donated', value: `MAD ${totalDonated.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 dark:bg-green-950/40', textColor: 'text-green-700 dark:text-green-300' },
    { title: 'Platform Fees', value: `MAD ${totalFees.toLocaleString()}`, icon: Wallet, color: 'bg-amber-50 dark:bg-amber-950/40', textColor: 'text-amber-700 dark:text-amber-300' },
    { title: 'Campaigns Supported', value: supportedCampaigns, icon: Users, color: 'bg-sky-50 dark:bg-sky-950/40', textColor: 'text-sky-700 dark:text-sky-300' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">My giving</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">My Donations</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Review your donation history, supported campaigns, messages, and platform fees.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="border-border/70 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`rounded-full p-2 ${stat.color}`}>
                        <Icon className={`h-4 w-4 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Donation History</CardTitle>
              <p className="text-sm text-muted-foreground">Donations linked to your account or email address.</p>
            </CardHeader>
            <CardContent className="p-0">
              {donationsWithCampaign.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">You have not made any donations yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead>Campaign</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donationsWithCampaign.map((donation) => (
                      <TableRow key={donation.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{donation.campaign_title}</TableCell>
                        <TableCell>
                          {donation.anonymous ? (
                            <Badge variant="secondary">Anonymous</Badge>
                          ) : (
                            <Badge variant="outline">{donation.donor_name || user.email || 'Public'}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700 dark:text-green-300">MAD {parseFloat(donation.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-amber-700 dark:text-amber-300">
                          MAD {parseFloat(donation.platform_fee || '0').toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {donation.message ? `"${donation.message}"` : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
