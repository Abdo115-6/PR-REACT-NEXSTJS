interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const safeValue = Number.isFinite(value) ? value : 0
  const clampedValue = Math.min(Math.max(safeValue, 0), 100)

  return (
    <div className={`w-full h-2 bg-red-100 rounded-full overflow-hidden dark:bg-muted ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}
