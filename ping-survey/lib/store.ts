/**
 * Zustand Store for Survey State Management
 *
 * Manages survey progress, answers, and persistence to localStorage
 */

import { create } from 'zustand'
import { SurveyAnswers, SurveyPayload } from './types'
import { generateUUID, getTimezone, getTimestamp, storage } from './utils'
import { SURVEY_CONFIG } from '@/config/survey'

const STORAGE_KEY = 'ping-survey-state'
const SUBMISSION_KEY = 'ping-survey-submitted'

type SurveyState = {
  // Survey metadata
  uuid: string
  currentStep: number
  startedAt: string | null
  completedAt: string | null
  isSubmitted: boolean

  // Answers
  answers: Partial<SurveyAnswers>

  // Actions
  init: () => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setAnswer: <K extends keyof SurveyAnswers>(key: K, value: SurveyAnswers[K]) => void
  getAnswer: <K extends keyof SurveyAnswers>(key: K) => SurveyAnswers[K] | undefined
  isStepValid: (step: number) => boolean
  buildPayload: () => SurveyPayload | null
  markSubmitted: () => void
  reset: () => void
  hasResumeData: () => boolean
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  // Initial state
  uuid: generateUUID(),
  currentStep: 0, // 0 = welcome screen
  startedAt: null,
  completedAt: null,
  isSubmitted: false,
  answers: {},

  // Initialize from localStorage if available
  init: () => {
    const savedState = storage.get<Partial<SurveyState>>(STORAGE_KEY, {})
    const isSubmitted = storage.get<boolean>(SUBMISSION_KEY, false)

    if (savedState && Object.keys(savedState).length > 0) {
      set({
        uuid: savedState.uuid || generateUUID(),
        currentStep: savedState.currentStep || 0,
        startedAt: savedState.startedAt || null,
        answers: savedState.answers || {},
        isSubmitted,
      })
    } else {
      // Fresh start
      const uuid = generateUUID()
      set({ uuid, currentStep: 0, startedAt: null, answers: {}, isSubmitted: false })
    }
  },

  // Set current step
  setStep: (step: number) => {
    const state = get()
    const newStep = Math.max(0, Math.min(step, SURVEY_CONFIG.totalSteps - 1))

    // Start timestamp on first real question
    const startedAt = state.startedAt || (newStep > 0 ? getTimestamp() : null)

    set({ currentStep: newStep, startedAt })
    persistState(get())
  },

  // Navigate to next step
  nextStep: () => {
    const state = get()
    if (state.currentStep < SURVEY_CONFIG.totalSteps - 1) {
      state.setStep(state.currentStep + 1)
    }
  },

  // Navigate to previous step
  prevStep: () => {
    const state = get()
    if (state.currentStep > 0) {
      state.setStep(state.currentStep - 1)
    }
  },

  // Set answer for a specific question
  setAnswer: (key, value) => {
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    }))
    persistState(get())
  },

  // Get answer for a specific question
  getAnswer: (key) => {
    return get().answers[key]
  },

  // Validate if a step can proceed
  isStepValid: (step: number) => {
    const state = get()

    // Welcome screen is always valid
    if (step === 0) return true

    const questionIndex = step - 1
    const question = SURVEY_CONFIG.questions[questionIndex]

    if (!question) return false

    switch (question.id) {
      case 'q1':
        const q1 = state.answers.q1_networking_views
        return Array.isArray(q1) && q1.length > 0 && q1.length <= 2

      case 'q2':
        return !!state.answers.q2_sharing_method

      case 'q3':
        const q3 = state.answers.q3_followup_frequency
        return typeof q3 === 'number' && q3 >= 1 && q3 <= 5

      case 'q4':
        const q4 = state.answers.q4_followup_barriers
        return Array.isArray(q4) && q4.length > 0 && q4.length <= 2

      case 'q5':
        return !!state.answers.q5_use_intent

      case 'q6':
        const q6 = state.answers.q6_killer_features
        return Array.isArray(q6) && q6.length > 0 && q6.length <= 3

      case 'q7':
        return !!state.answers.q7_price_willingness

      case 'q8':
        const lead = state.answers.lead
        return !!(
          lead &&
          lead.full_name &&
          lead.email &&
          lead.consent
        )

      default:
        return false
    }
  },

  // Build the final payload for submission
  buildPayload: () => {
    const state = get()

    // Validate all required answers are present
    const requiredKeys: (keyof SurveyAnswers)[] = [
      'q1_networking_views',
      'q2_sharing_method',
      'q3_followup_frequency',
      'q4_followup_barriers',
      'q5_use_intent',
      'q6_killer_features',
      'q7_price_willingness',
      'lead',
    ]

    for (const key of requiredKeys) {
      if (!state.answers[key]) {
        console.error(`Missing required answer: ${key}`)
        return null
      }
    }

    const payload: SurveyPayload = {
      ...(state.answers as SurveyAnswers),
      meta: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        tz: getTimezone(),
        startedAt: state.startedAt || getTimestamp(),
        completedAt: getTimestamp(),
      },
      uuid: state.uuid,
      version: SURVEY_CONFIG.version,
    }

    return payload
  },

  // Mark survey as submitted
  markSubmitted: () => {
    set({ isSubmitted: true, completedAt: getTimestamp() })
    storage.set(SUBMISSION_KEY, true)
    storage.remove(STORAGE_KEY) // Clear progress after submission
  },

  // Reset survey state
  reset: () => {
    storage.remove(STORAGE_KEY)
    storage.remove(SUBMISSION_KEY)
    set({
      uuid: generateUUID(),
      currentStep: 0,
      startedAt: null,
      completedAt: null,
      isSubmitted: false,
      answers: {},
    })
  },

  // Check if there's resume data
  hasResumeData: () => {
    const savedState = storage.get<Partial<SurveyState>>(STORAGE_KEY, {})
    return !!(savedState && savedState.currentStep && savedState.currentStep > 0)
  },
}))

// Helper to persist state to localStorage
function persistState(state: SurveyState) {
  storage.set(STORAGE_KEY, {
    uuid: state.uuid,
    currentStep: state.currentStep,
    startedAt: state.startedAt,
    answers: state.answers,
  })
}
