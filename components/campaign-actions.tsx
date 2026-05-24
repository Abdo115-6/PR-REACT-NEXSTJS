'use client'

import { Button } from '@/components/ui/button'
import { Heart, Share2, ChevronDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ShareButton() {
  const { toast } = useToast()

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast({
      title: 'Link copied!',
      description: 'Campaign link copied to clipboard',
    })
  }

  return (
    <Button className="flex-1" onClick={handleShare}>
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )
}

export function DonateNowButton() {
  const scrollToForm = () => {
    document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Button size="lg" className="w-full" onClick={scrollToForm}>
      <Heart className="w-5 h-5 mr-2" />
      Donate Now
    </Button>
  )
}
