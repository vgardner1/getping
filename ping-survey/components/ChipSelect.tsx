'use client'

/**
 * Chip Select Component
 *
 * Single/multi option chips with icon support and max-select enforcement
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Option = {
  value: string
  label: string
  icon?: string
}

type ChipSelectProps = {
  options: Option[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  maxSelect?: number
  mode?: 'single' | 'multi'
  className?: string
}

export function ChipSelect({
  options,
  value,
  onChange,
  maxSelect = 1,
  mode = 'single',
  className,
}: ChipSelectProps) {
  const [error, setError] = useState<string>('')

  const selectedValues = Array.isArray(value) ? value : value ? [value] : []

  const handleSelect = (optionValue: string) => {
    setError('')

    if (mode === 'single') {
      onChange(optionValue)
      return
    }

    // Multi-select mode
    const isSelected = selectedValues.includes(optionValue)

    if (isSelected) {
      // Deselect
      const newValues = selectedValues.filter((v) => v !== optionValue)
      onChange(newValues)
    } else {
      // Select
      if (selectedValues.length >= maxSelect) {
        setError(`Choose up to ${maxSelect} option${maxSelect > 1 ? 's' : ''}.`)
        setTimeout(() => setError(''), 3000)
        return
      }
      onChange([...selectedValues, optionValue])
    }
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option.value)

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-xl',
                'border-2 transition-all duration-200',
                'text-left min-h-[60px]',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
                isSelected
                  ? 'border-ring bg-ring/10 shadow-lg shadow-ring/20'
                  : 'border-grid hover:border-ring-soft bg-bg/50 hover:bg-grid/30'
              )}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              {option.icon && (
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {option.icon}
                </span>
              )}

              {/* Label */}
              <span
                className={cn(
                  'text-sm md:text-base font-medium transition-colors',
                  isSelected ? 'text-ring' : 'text-text'
                )}
              >
                {option.label}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ring flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-bg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-400 font-medium"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
