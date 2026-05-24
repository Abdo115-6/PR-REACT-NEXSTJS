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
  <Trophy key="1" className="w-4 h-4 text-yellow-500" />,
  <Medal key="2" className="w-4 h-4 text-gray-400" />,
  <Award key="3" className="w-4 h-4 text-amber-600" />,
]

const rankColors = [
  'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
  'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800',
  'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
]

export function DonorLeaderboard({ donors }: DonorLeaderboardProps) {
  if (donors.length === 0) return null

  const topDonors = donors.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Donors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topDonors.map((donor, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg border ${
                index < 3 ? rankColors[index] : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  )}
                </span>
                <span className="font-medium text-sm">
                  {donor.anonymous ? 'Anonymous' : donor.donor_name || 'Anonymous'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-sm">
                  MAD {donor.total_amount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
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
