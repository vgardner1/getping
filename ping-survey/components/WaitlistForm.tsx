'use client'

/**
 * Waitlist Form Component
 *
 * Lead capture form with React Hook Form + Zod validation
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { LeadSchema, LeadFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

type WaitlistFormProps = {
  onSubmit: (data: LeadFormData) => void
  isSubmitting?: boolean
}

export function WaitlistForm({ onSubmit, isSubmitting = false }: WaitlistFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(LeadSchema),
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-text mb-2">
          Full name <span className="text-ring">*</span>
        </label>
        <input
          {...register('full_name')}
          id="full_name"
          type="text"
          placeholder="Jane Doe"
          disabled={isSubmitting}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg border-2 transition-colors',
            'text-text placeholder-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.full_name ? 'border-red-500' : 'border-grid focus:border-ring'
          )}
        />
        {errors.full_name && (
          <p className="mt-1.5 text-sm text-red-400">{errors.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
          Email <span className="text-ring">*</span>
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          placeholder="jane@example.com"
          disabled={isSubmitting}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg border-2 transition-colors',
            'text-text placeholder-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.email ? 'border-red-500' : 'border-grid focus:border-ring'
          )}
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* LinkedIn URL (optional) */}
      <div>
        <label htmlFor="linkedin" className="block text-sm font-medium text-text mb-2">
          LinkedIn URL <span className="text-muted text-xs">(optional)</span>
        </label>
        <input
          {...register('linkedin')}
          id="linkedin"
          type="url"
          placeholder="https://linkedin.com/in/janedoe"
          disabled={isSubmitting}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg border-2 transition-colors',
            'text-text placeholder-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errors.linkedin ? 'border-red-500' : 'border-grid focus:border-ring'
          )}
        />
        {errors.linkedin && (
          <p className="mt-1.5 text-sm text-red-400">{errors.linkedin.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
          Role <span className="text-muted text-xs">(optional)</span>
        </label>
        <select
          {...register('role')}
          id="role"
          disabled={isSubmitting}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg border-2 border-grid transition-colors',
            'text-text',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <option value="">Select your role</option>
          <option value="Founder">Founder</option>
          <option value="Student">Student</option>
          <option value="Builder">Builder</option>
          <option value="Investor">Investor</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="org" className="block text-sm font-medium text-text mb-2">
          School or Company <span className="text-muted text-xs">(optional)</span>
        </label>
        <input
          {...register('org')}
          id="org"
          type="text"
          placeholder="MIT / Acme Corp"
          disabled={isSubmitting}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-bg border-2 border-grid transition-colors',
            'text-text placeholder-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3">
        <input
          {...register('consent')}
          id="consent"
          type="checkbox"
          disabled={isSubmitting}
          className={cn(
            'mt-1 w-5 h-5 rounded',
            'border-2 border-grid bg-bg',
            'text-ring focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'cursor-pointer'
          )}
        />
        <label htmlFor="consent" className="text-sm text-text cursor-pointer">
          I agree to be contacted about early access.{' '}
          <span className="text-ring">*</span>
        </label>
      </div>
      {errors.consent && (
        <p className="text-sm text-red-400 -mt-4">{errors.consent.message}</p>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full px-8 py-4 rounded-lg',
          'bg-ring text-bg font-bold text-lg',
          'shadow-lg shadow-ring/30',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          !isSubmitting && 'hover:shadow-xl hover:shadow-ring/40'
        )}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Joining...
          </span>
        ) : (
          'Join the Waitlist'
        )}
      </motion.button>
    </form>
  )
}
