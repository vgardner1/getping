'use client'

/**
 * Progress Ring Component
 *
 * Displays survey progress with segmented ring
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type ProgressRingProps = {
  current: number
  total: number
  className?: string
}

export function ProgressRing({ current, total, className }: ProgressRingProps) {
  const percentage = (current / total) * 100

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Segment indicators */}
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const isComplete = i < current
          const isCurrent = i === current

          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                isComplete
                  ? 'bg-ring w-8'
                  : isCurrent
                  ? 'bg-ring-soft w-8'
                  : 'bg-grid w-6'
              )}
            />
          )
        })}
      </div>

      {/* Text indicator */}
      <span className="text-xs font-medium text-muted tabular-nums">
        {current} / {total}
      </span>
    </div>
  )
}
