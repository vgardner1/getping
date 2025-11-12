'use client'

/**
 * Question Card Component
 *
 * Animated card container for each survey question with Framer Motion
 */

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type QuestionCardProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function QuestionCard({
  title,
  description,
  children,
  footer,
  className,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative z-10 w-full max-w-2xl mx-auto',
        'bg-gradient-to-b from-grid/40 to-bg/80 backdrop-blur-sm',
        'border border-grid rounded-2xl',
        'p-8 md:p-12',
        'shadow-2xl shadow-ring/5',
        className
      )}
    >
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-bold text-text mb-3 tracking-tight"
      >
        {title}
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted text-sm md:text-base mb-8"
        >
          {description}
        </motion.p>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Footer */}
      {footer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 pt-6 border-t border-grid"
        >
          {footer}
        </motion.div>
      )}
    </motion.div>
  )
}
