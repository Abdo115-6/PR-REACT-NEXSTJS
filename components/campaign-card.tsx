import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/progress-bar'
import { Heart } from 'lucide-react'

interface CampaignCardProps {
  id: string
  title: string
  description: string
  goalAmount: number
  currentAmount: number
  imageUrl?: string
  category: string
  donorCount: number
}

export function CampaignCard({
  id,
  title,
  description,
  goalAmount,
  currentAmount,
  imageUrl,
  category,
  donorCount,
}: CampaignCardProps) {
  const progress = (currentAmount / goalAmount) * 100

  return (
    <Link href={`/campaigns/${id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {imageUrl && (
          <div className="w-full h-48 bg-muted overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{category}</p>
            </div>
            <Heart className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="space-y-2">
            <ProgressBar value={Math.min(progress, 100)} />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">MAD {currentAmount.toLocaleString()}</span>
              <span className="text-muted-foreground">MAD {goalAmount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">{donorCount} donors</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="sm">
            Donate Now
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
