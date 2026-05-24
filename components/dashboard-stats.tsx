import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, Heart, Users, DollarSign } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalCampaigns: number
    totalRaised: number
    totalDonations: number
    totalDonors: number
    platformRevenue?: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Active Campaigns',
      value: stats.totalCampaigns,
      icon: Target,
      color: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Raised',
      value: `MAD ${stats.totalRaised.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      icon: Heart,
      color: 'bg-red-100 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Unique Donors',
      value: stats.totalDonors,
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  const platformStat = stats.platformRevenue !== undefined ? {
    title: 'Platform Revenue',
    value: `MAD ${stats.platformRevenue.toLocaleString()}`,
    icon: DollarSign,
    color: 'bg-amber-100 dark:bg-amber-900',
    textColor: 'text-amber-600 dark:text-amber-400',
  } : null

  const displayStats = platformStat ? [...statCards, platformStat] : statCards

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className={`w-4 h-4 ${stat.textColor}`} />
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
  )
}
