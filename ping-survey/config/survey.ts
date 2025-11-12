/**
 * PING Survey Configuration
 *
 * Single source of truth for all survey content, validation rules, and animation hints.
 * Non-developers can update copy and options here without touching component code.
 */

export const SURVEY_CONFIG = {
  version: 'v1',

  // Welcome screen (Scene 0)
  welcome: {
    title: "Welcome to Ping — where connections come full circle.",
    subtitle: "Tap to start the journey.",
    buttonText: "Start",
    animation: {
      type: 'ring-glow',
      intensity: 1.2,
    },
  },

  // Question definitions
  questions: [
    {
      id: 'q1',
      type: 'multi-select' as const,
      title: "How do you view networking today?",
      description: "Choose up to 2 that resonate with you.",
      maxSelect: 2,
      required: true,
      options: [
        {
          value: 'meeting_staying_touch',
          label: 'Meeting new people & staying in touch',
          icon: '👥',
        },
        {
          value: 'jobs_opportunities',
          label: 'Finding jobs or business opportunities',
          icon: '💼',
        },
        {
          value: 'learning_mentors',
          label: 'Learning from mentors or alumni',
          icon: '🎓',
        },
        {
          value: 'personal_brand',
          label: 'Building my personal brand',
          icon: '✨',
        },
        {
          value: 'connecting_creators',
          label: 'Connecting creators/founders',
          icon: '🚀',
        },
      ],
      animation: {
        type: 'node-highlight',
        hint: 'Selected nodes light up and link to core',
      },
    },
    {
      id: 'q2',
      type: 'single-select' as const,
      title: "When you meet someone new, how do you usually share info?",
      description: "Pick the one you use most often.",
      required: true,
      options: [
        {
          value: 'instagram',
          label: 'Exchanging Instagrams',
          icon: '📸',
        },
        {
          value: 'linkedin_qr',
          label: 'Scanning LinkedIn QR codes',
          icon: '💼',
        },
        {
          value: 'phone_numbers',
          label: 'Sharing phone numbers',
          icon: '📱',
        },
        {
          value: 'digital_cards',
          label: 'Using digital business cards',
          icon: '🃏',
        },
        {
          value: 'no_followup',
          label: "I usually don't follow up",
          icon: '🤷',
        },
      ],
      animation: {
        type: 'ripple',
        hint: 'Wave ripples from ring center on hover/selection',
      },
    },
    {
      id: 'q3',
      type: 'slider' as const,
      title: "How often do you follow up afterward?",
      description: "Slide to reflect your reality.",
      required: true,
      min: 1,
      max: 5,
      labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
      animation: {
        type: 'orbit-speed',
        hint: 'Satellite orbit speed increases with higher values',
      },
    },
    {
      id: 'q4',
      type: 'multi-select' as const,
      title: "What prevents you from following up?",
      description: "Choose up to 2 biggest blockers.",
      maxSelect: 2,
      required: true,
      options: [
        {
          value: 'forgetting_info',
          label: 'Forgetting or losing their info',
          icon: '🤔',
        },
        {
          value: 'feeling_awkward',
          label: 'Feeling awkward about reaching out',
          icon: '😅',
        },
        {
          value: 'too_busy',
          label: 'Being too busy',
          icon: '⏰',
        },
        {
          value: 'no_system',
          label: 'No system to organize contacts',
          icon: '📋',
        },
        {
          value: 'no_interest',
          label: 'Lack of real interest',
          icon: '🤐',
        },
      ],
      animation: {
        type: 'broken-links',
        hint: 'Shows dropped red links that re-knit on select',
      },
    },
    {
      id: 'q5',
      type: 'single-select' as const,
      title: "Imagine a ring that lets you 'Ping' someone and instantly share your contact, socials, and a short intro.",
      description: "Would you use it?",
      required: true,
      hasConditionalFollowup: true,
      options: [
        {
          value: 'definitely',
          label: 'Definitely',
          icon: '🔥',
        },
        {
          value: 'maybe',
          label: 'Maybe',
          icon: '🤔',
        },
        {
          value: 'not_sure',
          label: 'Not sure yet',
          icon: '🤷',
        },
      ],
      // Follow-up appears if "not_sure" selected
      followup: {
        condition: 'not_sure',
        type: 'text' as const,
        title: "What's your hesitation?",
        placeholder: 'Optional — share your thoughts (120 chars)',
        maxLength: 120,
        required: false,
      },
      animation: {
        type: 'core-pulse',
        hint: 'Positive choices trigger brighter core pulse',
      },
    },
    {
      id: 'q6',
      type: 'multi-select' as const,
      title: "What would make this indispensable for you?",
      description: "Choose up to 3 features you'd use daily.",
      maxSelect: 3,
      required: true,
      options: [
        {
          value: 'auto_reminders',
          label: 'Auto follow-up reminders',
          icon: '⏰',
        },
        {
          value: 'network_visualizer',
          label: 'Network visualizer (see your connections)',
          icon: '🕸️',
        },
        {
          value: 'outreach_tone',
          label: 'Personalized outreach tone suggestions',
          icon: '✍️',
        },
        {
          value: 'contact_scoring',
          label: 'Contact scoring (who to reach first)',
          icon: '⭐',
        },
        {
          value: 'calendar_integration',
          label: 'Calendar integration',
          icon: '📅',
        },
        {
          value: 'relationship_analytics',
          label: 'Relationship analytics',
          icon: '📊',
        },
      ],
      animation: {
        type: 'edge-drawing',
        hint: 'Selecting features draws glowing edges between nodes',
      },
    },
    {
      id: 'q7',
      type: 'single-select' as const,
      title: "How much would you pay for this experience?",
      description: "Be honest — helps us price it right.",
      required: true,
      options: [
        {
          value: '$0',
          label: '$0 — Free only',
          icon: '🆓',
        },
        {
          value: '$10-20',
          label: '$10–$20 (starter plan)',
          icon: '💳',
        },
        {
          value: '$30-50',
          label: '$30–$50 (premium with analytics)',
          icon: '💎',
        },
        {
          value: '$100+',
          label: '$100+ (hardware + software bundle)',
          icon: '🔥',
        },
      ],
      animation: {
        type: 'ring-scale',
        hint: 'Ring scales slightly with higher tiers',
      },
    },
    {
      id: 'q8',
      type: 'waitlist-form' as const,
      title: "Be first to wear the Ping Ring.",
      description: "Join the waitlist and we'll notify you for early access.",
      required: true,
      fields: [
        {
          name: 'full_name',
          label: 'Full name',
          type: 'text',
          placeholder: 'Jane Doe',
          required: true,
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'jane@example.com',
          required: true,
        },
        {
          name: 'linkedin',
          label: 'LinkedIn URL',
          type: 'url',
          placeholder: 'https://linkedin.com/in/janedoe',
          required: false,
        },
        {
          name: 'role',
          label: 'Role',
          type: 'select',
          placeholder: 'Select your role',
          required: false,
          options: ['Founder', 'Student', 'Builder', 'Investor', 'Other'],
        },
        {
          name: 'org',
          label: 'School or Company',
          type: 'text',
          placeholder: 'MIT / Acme Corp',
          required: false,
        },
      ],
      consent: {
        required: true,
        text: 'I agree to be contacted about early access.',
      },
      animation: {
        type: 'zoom-out-orbit',
        hint: 'Camera zooms out to reveal user as new glowing node',
      },
    },
  ],

  // UI copy
  copy: {
    buttons: {
      start: 'Start',
      next: 'Next',
      back: 'Back',
      skip: 'Skip',
      submit: 'Join the Waitlist',
    },
    errors: {
      maxSelect: (max: number) => `Choose up to ${max} option${max > 1 ? 's' : ''}.`,
      required: 'This field is required.',
      invalidEmail: 'Enter a valid email.',
      invalidUrl: 'Enter a valid URL.',
    },
    success: "You're on the list. See you on launch day.",
    helperText: 'every circle is a connection — click to explore',
  },

  // Total number of questions (including welcome)
  get totalSteps() {
    return this.questions.length + 1; // +1 for welcome
  },
} as const

// Export types derived from config
export type QuestionId = typeof SURVEY_CONFIG.questions[number]['id']
export type QuestionType = typeof SURVEY_CONFIG.questions[number]['type']
