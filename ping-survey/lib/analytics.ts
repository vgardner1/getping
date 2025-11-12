/**
 * Analytics Wrapper for Google Analytics
 *
 * Posts events to window.gtag if GA_MEASUREMENT_ID is present; otherwise no-op.
 */

type EventName =
  | 'survey_started'
  | 'question_answered'
  | 'survey_completed'
  | 'waitlist_joined'
  | 'page_view'

type EventParams = {
  [key: string]: string | number | boolean
}

/**
 * Track an analytics event
 */
export function trackEvent(eventName: EventName, params?: EventParams): void {
  // Check if gtag is available
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    const gtag = (window as any).gtag
    gtag('event', eventName, params)

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, params)
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics - No Gtag]', eventName, params)
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title,
  })
}

/**
 * Track survey started
 */
export function trackSurveyStarted(): void {
  trackEvent('survey_started', {
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track question answered
 */
export function trackQuestionAnswered(questionId: string, answer: any): void {
  trackEvent('question_answered', {
    question_id: questionId,
    answer_type: typeof answer,
    has_value: !!answer,
  })
}

/**
 * Track survey completed
 */
export function trackSurveyCompleted(uuid: string): void {
  trackEvent('survey_completed', {
    submission_id: uuid,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track waitlist joined
 */
export function trackWaitlistJoined(email: string): void {
  trackEvent('waitlist_joined', {
    // Don't send PII in plain text - hash or omit
    has_email: !!email,
    timestamp: new Date().toISOString(),
  })
}
