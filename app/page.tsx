import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import { CampaignCard } from '@/components/campaign-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-red-50/40 dark:bg-black">
        {/* Hero Section */}
        <section className="relative min-h-[560px] overflow-hidden py-16 md:py-24">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/donation.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/75 via-red-900/55 to-red-50 dark:to-black" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Support Causes That Matter
              </h1>
              <p className="text-xl text-red-50/90 max-w-2xl">
                DonationFlow makes it easy to create campaigns, donate to causes you care about,
                and make a real impact in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-red-600 text-white hover:bg-red-700">Start a Campaign</Button>
                </Link>
                <Link href="/campaigns">
                  <Button size="lg" variant="outline" className="border-white/70 bg-white/10 text-white hover:bg-white hover:text-red-700">
                    Explore Campaigns
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-8 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-200">
                  MAD {campaignsWithDonorCounts.reduce((sum, c) => sum + (c.current_amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-2">Total Raised</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-200">{campaignsWithDonorCounts.length}</p>
                <p className="text-muted-foreground mt-2">Active Campaigns</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-200">
                  {campaignsWithDonorCounts.reduce((sum, c) => sum + c.donorCount, 0)}
                </p>
                <p className="text-muted-foreground mt-2">Donors</p>
              </div>
            </div>
          </div>
        </section>

        {/* Campaigns Section */}
        <section id="campaigns" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-red-800 dark:text-red-100">Active Campaigns</h2>

            {campaignsWithDonorCounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">No campaigns yet. Be the first to create one!</p>
                <Link href="/auth/sign-up">
                  <Button>Create Campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </section>
      </main>
    </>
  )
}
