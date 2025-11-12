'use client'

/**
 * Survey Page (/survey)
 *
 * 8-step animated survey experience with orbiting background
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSurveyStore } from '@/lib/store'
import { SURVEY_CONFIG } from '@/config/survey'
import { SceneCanvas } from '@/components/SceneCanvas'
import { QuestionCard } from '@/components/QuestionCard'
import { ChipSelect } from '@/components/ChipSelect'
import { Slider } from '@/components/Slider'
import { WaitlistForm } from '@/components/WaitlistForm'
import { ProgressRing } from '@/components/ProgressRing'
import { Toast } from '@/components/Toast'
import {
  trackPageView,
  trackSurveyStarted,
  trackQuestionAnswered,
} from '@/lib/analytics'
import { LeadFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function SurveyPage() {
  const router = useRouter()
  const {
    currentStep,
    init,
    setStep,
    nextStep,
    prevStep,
    setAnswer,
    getAnswer,
    isStepValid,
  } = useSurveyStore()

  const [mounted, setMounted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  useEffect(() => {
    init()
    setMounted(true)
    trackPageView('/survey', 'Survey')
  }, [init])

  useEffect(() => {
    if (mounted && currentStep === 0) {
      trackSurveyStarted()
    }
  }, [mounted, currentStep])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ring/30 border-t-ring rounded-full animate-spin" />
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep > 0 && !isStepValid(currentStep)) {
      setToast({ message: SURVEY_CONFIG.copy.errors.required, type: 'error' })
      return
    }
    nextStep()
  }

  const handleBack = () => {
    prevStep()
  }

  const getSceneConfig = () => {
    // Customize scene based on current question
    const questionIndex = currentStep - 1
    const question = SURVEY_CONFIG.questions[questionIndex]

    if (!question) return { intensity: 1 }

    switch (question.id) {
      case 'q1':
        const q1Answer = getAnswer('q1_networking_views') as string[] | undefined
        return {
          intensity: 1,
          highlightIndices: q1Answer ? [0, 1, 2, 3, 4].slice(0, q1Answer.length) : [],
        }
      case 'q5':
        const q5Answer = getAnswer('q5_use_intent')
        return {
          intensity: q5Answer === 'definitely' ? 1.5 : q5Answer === 'maybe' ? 1.2 : 1,
        }
      case 'q7':
        const q7Answer = getAnswer('q7_price_willingness')
        const scale = q7Answer === '$100+' ? 1.2 : q7Answer === '$30-50' ? 1.1 : 1
        return { ringScale: scale }
      default:
        return { intensity: 1 }
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* 3D Scene Background */}
      <div className="fixed inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="w-full h-full max-w-4xl">
          <SceneCanvas config={getSceneConfig()} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-20 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <ProgressRing current={currentStep} total={SURVEY_CONFIG.totalSteps} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-20">
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <WelcomeScreen key="welcome" onStart={handleNext} />
          ) : (
            <QuestionScreen
              key={`question-${currentStep}`}
              questionIndex={currentStep - 1}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

// ============================================================================
// Welcome Screen (Step 0)
// ============================================================================

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <QuestionCard
      title={SURVEY_CONFIG.welcome.title}
      description={SURVEY_CONFIG.welcome.subtitle}
      footer={
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-8 py-4 bg-ring text-bg font-bold text-lg rounded-lg shadow-lg shadow-ring/30 transition-all hover:shadow-xl hover:shadow-ring/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
        >
          {SURVEY_CONFIG.copy.buttons.start}
        </motion.button>
      }
    >
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-32 h-32 rounded-full border-4 border-ring shadow-2xl shadow-ring/50"
        />
      </div>
    </QuestionCard>
  )
}

// ============================================================================
// Question Screen (Steps 1-8)
// ============================================================================

function QuestionScreen({
  questionIndex,
  onNext,
  onBack,
}: {
  questionIndex: number
  onNext: () => void
  onBack: () => void
}) {
  const router = useRouter()
  const question = SURVEY_CONFIG.questions[questionIndex]
  const { getAnswer, setAnswer, isStepValid } = useSurveyStore()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFollowup, setShowFollowup] = useState(false)

  if (!question) return null

  const currentStepNumber = questionIndex + 1

  const handleAnswerChange = (value: any) => {
    const answerKey = question.id.replace('q', 'q') as keyof typeof getAnswer

    // Map question ID to answer key
    switch (question.id) {
      case 'q1':
        setAnswer('q1_networking_views', value)
        trackQuestionAnswered('q1', value)
        break
      case 'q2':
        setAnswer('q2_sharing_method', value)
        trackQuestionAnswered('q2', value)
        break
      case 'q3':
        setAnswer('q3_followup_frequency', value)
        trackQuestionAnswered('q3', value)
        break
      case 'q4':
        setAnswer('q4_followup_barriers', value)
        trackQuestionAnswered('q4', value)
        break
      case 'q5':
        setAnswer('q5_use_intent', value)
        trackQuestionAnswered('q5', value)
        // Show follow-up if "not_sure" selected
        if (value === 'not_sure') {
          setShowFollowup(true)
        } else {
          setShowFollowup(false)
          setAnswer('q5_hesitation_note', undefined)
        }
        break
      case 'q6':
        setAnswer('q6_killer_features', value)
        trackQuestionAnswered('q6', value)
        break
      case 'q7':
        setAnswer('q7_price_willingness', value)
        trackQuestionAnswered('q7', value)
        break
    }
  }

  const handleWaitlistSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)

    // Set lead data
    setAnswer('lead', data)

    try {
      // Build and submit payload
      const store = useSurveyStore.getState()
      const payload = store.buildPayload()

      if (!payload) {
        throw new Error('Invalid survey data')
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      // Mark as submitted
      store.markSubmitted()

      // Redirect to thank you page
      router.push('/thanks')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single-select':
      case 'multi-select':
        const currentValue = getAnswer(question.id.replace('q', 'q') as any)
        return (
          <>
            <ChipSelect
              options={question.options || []}
              value={currentValue || (question.type === 'multi-select' ? [] : '')}
              onChange={handleAnswerChange}
              mode={question.type === 'multi-select' ? 'multi' : 'single'}
              maxSelect={question.maxSelect || 1}
            />

            {/* Conditional follow-up for Q5 */}
            {question.id === 'q5' && showFollowup && question.followup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-grid"
              >
                <label htmlFor="q5-followup" className="block text-sm font-medium text-text mb-2">
                  {question.followup.title}
                </label>
                <textarea
                  id="q5-followup"
                  value={(getAnswer('q5_hesitation_note') as string) || ''}
                  onChange={(e) => setAnswer('q5_hesitation_note', e.target.value)}
                  placeholder={question.followup.placeholder}
                  maxLength={question.followup.maxLength}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-bg border-2 border-grid focus:border-ring text-text placeholder-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
                />
                <p className="mt-1 text-xs text-muted text-right">
                  {((getAnswer('q5_hesitation_note') as string) || '').length} /{' '}
                  {question.followup.maxLength}
                </p>
              </motion.div>
            )}
          </>
        )

      case 'slider':
        return (
          <Slider
            value={(getAnswer('q3_followup_frequency') as number) || 3}
            onChange={handleAnswerChange}
            min={question.min}
            max={question.max}
            labels={question.labels}
          />
        )

      case 'waitlist-form':
        const leadData = getAnswer('lead') as LeadFormData | undefined
        return (
          <WaitlistForm
            onSubmit={handleWaitlistSubmit}
            isSubmitting={isSubmitting}
          />
        )

      default:
        return null
    }
  }

  const canProceed = isStepValid(currentStepNumber)
  const isLastQuestion = question.type === 'waitlist-form'

  return (
    <QuestionCard
      title={question.title}
      description={question.description}
      footer={
        !isLastQuestion && (
          <div className="flex gap-4">
            {currentStepNumber > 1 && (
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-lg border-2 border-grid text-text font-medium hover:border-ring transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
              >
                {SURVEY_CONFIG.copy.buttons.back}
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={cn(
                'flex-1 px-8 py-3 rounded-lg font-bold transition-all',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg',
                canProceed
                  ? 'bg-ring text-bg shadow-lg shadow-ring/30 hover:shadow-xl hover:shadow-ring/40'
                  : 'bg-grid text-muted cursor-not-allowed'
              )}
            >
              {SURVEY_CONFIG.copy.buttons.next}
            </button>
          </div>
        )
      }
    >
      {renderQuestionContent()}
    </QuestionCard>
  )
}
