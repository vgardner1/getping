/**
 * TypeScript type definitions for PING Survey
 */

import { z } from 'zod'

// ============================================================================
// Survey Answer Types
// ============================================================================

export type SurveyAnswers = {
  q1_networking_views: string[] // up to 2
  q2_sharing_method: string // single
  q3_followup_frequency: number // 1-5
  q4_followup_barriers: string[] // up to 2
  q5_use_intent: 'definitely' | 'maybe' | 'not_sure'
  q5_hesitation_note?: string // optional follow-up
  q6_killer_features: string[] // up to 3
  q7_price_willingness: '$0' | '$10-20' | '$30-50' | '$100+'
  lead: {
    full_name: string
    email: string
    linkedin?: string
    role?: string
    org?: string
    consent: boolean
  }
}

export type SurveyPayload = SurveyAnswers & {
  meta: {
    userAgent: string
    tz: string
    startedAt: string
    completedAt?: string
  }
  uuid: string
  version: string
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const LeadSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  role: z.string().optional(),
  org: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to be contacted',
  }),
})

export const SurveyPayloadSchema = z.object({
  q1_networking_views: z.array(z.string()).min(1).max(2),
  q2_sharing_method: z.string().min(1),
  q3_followup_frequency: z.number().min(1).max(5),
  q4_followup_barriers: z.array(z.string()).min(1).max(2),
  q5_use_intent: z.enum(['definitely', 'maybe', 'not_sure']),
  q5_hesitation_note: z.string().max(120).optional(),
  q6_killer_features: z.array(z.string()).min(1).max(3),
  q7_price_willingness: z.enum(['$0', '$10-20', '$30-50', '$100+']),
  lead: LeadSchema,
  meta: z.object({
    userAgent: z.string(),
    tz: z.string(),
    startedAt: z.string(),
    completedAt: z.string().optional(),
  }),
  uuid: z.string().uuid(),
  version: z.string(),
})

export type LeadFormData = z.infer<typeof LeadSchema>

// ============================================================================
// Component Prop Types
// ============================================================================

export type AnimationType =
  | 'ring-glow'
  | 'node-highlight'
  | 'ripple'
  | 'orbit-speed'
  | 'broken-links'
  | 'core-pulse'
  | 'edge-drawing'
  | 'ring-scale'
  | 'zoom-out-orbit'

export type SceneConfig = {
  intensity?: number
  highlightIndices?: number[]
  successPulse?: boolean
  orbitSpeed?: number
  brokenLinks?: boolean
  edgeGlow?: boolean
  ringScale?: number
}

// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type SubmissionResponse = {
  id: string
  timestamp: string
}
