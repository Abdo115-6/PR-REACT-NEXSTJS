import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/progress-bar'
import { ArrowRight, Users } from 'lucide-react'

interface CampaignCardProps {
  id: string
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  category: string
  donorCount: number
}

export function CampaignCard({
  id,
  title,
  description,
  goalAmount,
  currentAmount,
  category,
  donorCount,
}: CampaignCardProps) {
  const progress = (currentAmount / goalAmount) * 100
  const safeProgress = Number.isFinite(progress) ? Math.min(progress, 100) : 0

  return (
    <Link href={`/campaigns/${id}`} className="block h-full">
      <Card className="group h-full overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md dark:hover:border-red-900">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-5 py-4">
          <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 shadow-sm dark:bg-black/80 dark:text-red-200">
            {category}
          </div>
          <div className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {safeProgress.toFixed(0)}% funded
          </div>
        </div>
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="line-clamp-2 text-xl leading-snug">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  MAD {currentAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">raised</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">MAD {goalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">goal</p>
              </div>
            </div>
            <ProgressBar value={safeProgress} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{safeProgress.toFixed(0)}% funded</span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {donorCount} donor{donorCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-red-600 text-white hover:bg-red-700" size="sm">
            View Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
