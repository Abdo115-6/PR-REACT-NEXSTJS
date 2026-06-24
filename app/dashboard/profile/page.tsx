import Navbar from '@/components/navbar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays, Heart, Settings, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import { RealtimeDonations } from '@/components/realtime-donations'
import { AccountRealtime } from '@/components/account-realtime'
import { resolveProfileAvatarUrl, resolveProfileDisplayName } from '@/lib/profile-data'

type ProfileDonation = {
  id: string
  amount: string
  donor_id: string | null
  created_at: string
  campaign_id: string | null
}

function toNumber(value: string | number | null | undefined) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

function formatDate(value: string | null | undefined) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString()
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const admin = isAdmin(user)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle()

  const { data: campaigns } = admin
    ? await supabase
        .from('campaigns')
        .select('id, title, goal_amount, current_amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaignIds = campaigns?.map((campaign) => campaign.id) || []
  let donations: ProfileDonation[] = []
  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from('donations')
      .select('id, amount, donor_id, created_at, campaign_id')
      .in('campaign_id', campaignIds)
    donations = data || []
  }

  const fullName = resolveProfileDisplayName(user, profile)
  const avatarUrl = resolveProfileAvatarUrl(user, profile)
  const lastUpdatedAt = profile?.updated_at || user.updated_at || null
  const avatarInitials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

  const totalRaised = campaigns?.reduce((sum, campaign) => sum + toNumber(campaign.current_amount), 0) || 0
  const totalGoal = campaigns?.reduce((sum, campaign) => sum + toNumber(campaign.goal_amount), 0) || 0
  const totalDonations = donations?.length || 0
  const totalCampaigns = campaigns?.length || 0

  return (
    <>
      <Navbar />
      <RealtimeDonations showToast={false} refreshOnChange />
      <AccountRealtime profileUserId={user.id} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Profile</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{fullName}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review your account identity and the activity tied to your campaigns.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              {admin && (
                <Link href="/dashboard/create">
                  <Button size="sm" className="text-sm">
                    <Heart className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6">
              <Card className="overflow-hidden border-border/70 shadow-sm">
                <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-6 py-7 text-white sm:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-14 border border-white/20 bg-white/10">
                        <AvatarImage src={avatarUrl} alt={fullName} />
                        <AvatarFallback className="bg-white/10 text-sm font-semibold text-white">
                          {avatarInitials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/75">Account</p>
                        <h2 className="mt-1 text-xl font-semibold">{fullName}</h2>
                        <p className="text-xs text-white/80">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/15 text-[11px] text-white hover:bg-white/20">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Verified user
                      </Badge>
                      <Badge className="bg-white/15 text-[11px] text-white hover:bg-white/20">
                        <CalendarDays className="mr-1 h-3.5 w-3.5" />
                        Joined {formatDate(profile?.created_at || user.created_at) || 'Unknown'}
                      </Badge>
                      {lastUpdatedAt && (
                        <Badge className="bg-white/15 text-[11px] text-white hover:bg-white/20">
                          Profile updated {formatDate(lastUpdatedAt) || 'Unknown'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                  <Stat label="Campaigns" value={totalCampaigns.toString()} />
                  <Stat label="Raised" value={`MAD ${totalRaised.toLocaleString()}`} />
                  <Stat label="Goal" value={`MAD ${totalGoal.toLocaleString()}`} />
                  <Stat label="Donations" value={totalDonations.toString()} />
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Account details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DetailRow
                    label="Full name"
                    value={
                      profile?.full_name ||
                      (user.user_metadata?.full_name as string | undefined) ||
                      (user.user_metadata?.name as string | undefined) ||
                      (user.user_metadata?.display_name as string | undefined) ||
                      'Not set'
                    }
                  />
                  <DetailRow label="Email" value={user.email || 'Not available'} />
                  <DetailRow
                    label="Last updated"
                    value={formatDateTime(lastUpdatedAt) || 'Not updated yet'}
                  />
                  <DetailRow label="Profile ID" value={user.id} mono />
                  <Separator />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Profile data is sourced from your Supabase profile row and auth metadata.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {admin && (
                    <Link href="/dashboard/create" className="block">
                      <Button className="w-full" size="sm">
                        Create a campaign
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard/settings" className="block">
                    <Button variant="outline" className="w-full" size="sm">
                      Open settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Recent campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns && campaigns.length > 0 ? (
                    <div className="space-y-2.5">
                      {campaigns.slice(0, 5).map((campaign) => {
                        const progress = Math.min(
                          (toNumber(campaign.current_amount) / Math.max(toNumber(campaign.goal_amount), 1)) * 100,
                          100
                        )

                        return (
                          <div
                            key={campaign.id}
                            className="rounded-xl border bg-muted/20 p-3.5 transition-colors hover:bg-muted/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{campaign.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  MAD {toNumber(campaign.current_amount).toLocaleString()} raised
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-5 text-center text-xs text-muted-foreground">
                      {admin
                        ? 'No campaigns yet. Create your first campaign to start tracking activity here.'
                        : 'Campaign management is reserved for admins.'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono text-xs break-all sm:text-right' : 'font-medium sm:text-right'}>
        {value}
      </span>
    </div>
  )
}
