'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="border-border bg-background/80 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-border dark:bg-card/80 dark:text-red-100 dark:hover:bg-muted/70"
    >
      <Sun className="hidden w-4 h-4 dark:block" />
      <Moon className="w-4 h-4 dark:hidden" />
    </Button>
  )
}
