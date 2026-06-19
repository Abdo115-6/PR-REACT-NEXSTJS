import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award } from 'lucide-react'

interface TopDonor {
  donor_name: string | null
  total_amount: number
  donation_count: number
  anonymous: boolean
}

interface DonorLeaderboardProps {
  donors: TopDonor[]
}

const rankIcons = [
  <Trophy key="1" className="h-4 w-4 text-amber-600 dark:text-amber-300" />,
  <Medal key="2" className="h-4 w-4 text-slate-500 dark:text-slate-300" />,
  <Award key="3" className="h-4 w-4 text-orange-600 dark:text-orange-300" />,
]

const rankColors = [
  'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20',
  'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30',
  'border-orange-200 bg-orange-50/60 dark:border-orange-900 dark:bg-orange-950/20',
]

export function DonorLeaderboard({ donors }: DonorLeaderboardProps) {
  if (donors.length === 0) return null

  const topDonors = donors.slice(0, 10)

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          Top Donors
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {topDonors.map((donor, index) => (
            <div
              key={index}
              className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 ${
                index < 3 ? rankColors[index] : 'border-transparent bg-muted/20'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  )}
                </span>
                <span className="truncate text-sm font-medium">
                  {donor.anonymous ? 'Anonymous' : donor.donor_name || 'Anonymous'}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="block text-sm font-semibold">
                  MAD {donor.total_amount.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {donor.donation_count} donation{donor.donation_count > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
