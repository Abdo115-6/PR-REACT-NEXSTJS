import Link from 'next/link'
import Navbar from '@/components/navbar'
import { CampaignCard } from '@/components/campaign-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, CircleDollarSign, HandHeart, Search } from 'lucide-react'
import { isAdmin } from '@/lib/auth'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const admin = isAdmin(user)

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  let campaignsWithDonorCounts: any[] = []

  if (campaigns && campaigns.length > 0) {
    const donationCounts = await Promise.all(
      campaigns.map(async (campaign) => {
        const { count } = await supabase
          .from('donations')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
        return { campaignId: campaign.id, count: count || 0 }
      })
    )

    campaignsWithDonorCounts = campaigns.map((campaign) => {
      const donorCount = donationCounts.find((dc) => dc.campaignId === campaign.id)?.count || 0
      return { ...campaign, donorCount }
    })
  }

  const totalRaised = campaignsWithDonorCounts.reduce(
    (sum, campaign) => sum + parseFloat(campaign.current_amount || '0'),
    0
  )
  const totalGoal = campaignsWithDonorCounts.reduce(
    (sum, campaign) => sum + parseFloat(campaign.goal_amount || '0'),
    0
  )
  const totalDonors = campaignsWithDonorCounts.reduce((sum, campaign) => sum + campaign.donorCount, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="border-b bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Active campaigns</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                Discover verified fundraising campaigns
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Browse active causes, compare progress, and support campaigns with transparent donation tracking.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {admin && (
                  <Link href="/dashboard/create">
                    <Button className="bg-red-600 text-white hover:bg-red-700">
                      Start a Campaign
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link href="#campaign-list">
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HandHeart className="h-4 w-4 text-red-600" />
                  Campaigns
                </div>
                <p className="mt-2 text-2xl font-bold">{campaignsWithDonorCounts.length}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CircleDollarSign className="h-4 w-4 text-green-600" />
                  Raised
                </div>
                <p className="mt-2 text-2xl font-bold">MAD {totalRaised.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HandHeart className="h-4 w-4 text-sky-600" />
                  Donors
                </div>
                <p className="mt-2 text-2xl font-bold">{totalDonors.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="campaign-list" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Campaign directory</h2>
              <p className="mt-2 text-muted-foreground">
                {totalGoal > 0
                  ? `MAD ${totalRaised.toLocaleString()} raised toward MAD ${totalGoal.toLocaleString()} in total goals.`
                  : 'Support the first active campaign when it becomes available.'}
              </p>
            </div>
          </div>

          {campaignsWithDonorCounts.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-card p-10 text-center">
              <h3 className="text-lg font-semibold">No active campaigns yet</h3>
              <p className="mt-2 text-muted-foreground">
                {admin
                  ? 'Create the first campaign and start collecting donations.'
                  : 'New campaigns will appear here when an admin publishes them.'}
              </p>
              {admin && (
                <Link href="/dashboard/create" className="mt-6 inline-block">
                  <Button>Create Campaign</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {campaignsWithDonorCounts.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description || ''}
                  goalAmount={parseFloat(campaign.goal_amount)}
                  currentAmount={parseFloat(campaign.current_amount)}
                  category={campaign.category || 'General'}
                  donorCount={campaign.donorCount}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
