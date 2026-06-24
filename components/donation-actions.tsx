'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { PencilLine, Trash2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface DonationActionsProps {
  donationId: string
  amount: number
  editHref: string
}

export function DonationActions({ donationId, amount, editHref }: DonationActionsProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { error } = await supabase.from('donations').delete().eq('id', donationId)

      if (error) throw error

      toast({
        title: 'Donation deleted',
        description: 'The donation has been removed and the campaign total has been updated.',
      })

      setOpen(false)
      router.refresh()
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to delete donation'),
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
        aria-label="Edit donation"
        title="Edit donation"
      >
        <Link href={editHref}>
          <PencilLine className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950"
            aria-label="Delete donation"
            title="Delete donation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-red-100 bg-white dark:border-border dark:bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Donation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this donation (MAD {amount.toLocaleString()}) and update the campaign total. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
