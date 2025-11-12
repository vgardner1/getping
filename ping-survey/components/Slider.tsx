'use client'

/**
 * Slider Component
 *
 * Accessible slider with labeled ticks (1-5)
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type SliderProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  labels?: string[]
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 1,
  max = 5,
  labels = [],
  className,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('space-y-6', className)}>
      {/* Slider track */}
      <div className="relative pt-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="slider-input w-full h-2 bg-grid rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
          style={{
            background: `linear-gradient(to right, #16FF88 0%, #16FF88 ${percentage}%, #0E1414 ${percentage}%, #0E1414 100%)`,
          }}
        />

        {/* Thumb indicator */}
        <motion.div
          className="absolute top-4 w-6 h-6 -mt-2 pointer-events-none"
          style={{
            left: `calc(${percentage}% - 12px)`,
          }}
          animate={{
            scale: isDragging ? 1.3 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-6 h-6 rounded-full bg-ring shadow-lg shadow-ring/50 border-2 border-bg" />
        </motion.div>

        {/* Tick marks */}
        <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const tickValue = min + i
            const isActive = tickValue <= value

            return (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  isActive ? 'bg-ring' : 'bg-grid'
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex justify-between text-xs md:text-sm">
          {labels.map((label, i) => {
            const labelValue = min + i
            const isActive = labelValue === value

            return (
              <span
                key={i}
                className={cn(
                  'transition-colors font-medium',
                  isActive ? 'text-ring' : 'text-muted'
                )}
              >
                {label}
              </span>
            )
          })}
        </div>
      )}

      {/* Current value indicator */}
      <div className="text-center">
        <motion.span
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block text-2xl font-bold text-ring"
        >
          {labels[value - min] || value}
        </motion.span>
      </div>
    </div>
  )
}
