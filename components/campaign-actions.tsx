'use client'

import { useState } from 'react'
import { ArrowDown, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  className?: string
}

export function ShareButton({ className }: ActionButtonProps) {
  const { toast } = useToast()
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    if (typeof window === 'undefined') {
      return
    }
    setSharing(true)

    try {
      const shareUrl = window.location.href
      const shareTitle = document.title || 'DonationFlow campaign'

      if (navigator.share) {
        await navigator.share({ title: shareTitle, url: shareUrl })
        toast({
          title: 'Link shared',
          description: 'The campaign link was shared successfully.',
        })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: 'Link copied',
          description: 'Paste the campaign link anywhere you want to share it.',
        })
        return
      }

      throw new Error('Sharing is not supported in this browser.')
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      toast({
        title: 'Unable to share',
        description: 'Copy the page link from the address bar instead.',
        variant: 'destructive',
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={sharing}
      className={cn('w-full sm:w-auto', className)}
    >
      <Share2 className="h-4 w-4" />
      {sharing ? 'Sharing...' : 'Share'}
    </Button>
  )
}

export function DonateNowButton({ className }: ActionButtonProps) {
  const handleClick = () => {
    const target = document.getElementById('donation-form')

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.location.hash = '#donation-form'
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleClick}
      className={cn('w-full bg-red-600 text-white hover:bg-red-700', className)}
    >
      <ArrowDown className="h-4 w-4" />
      Donate now
    </Button>
  )
}
