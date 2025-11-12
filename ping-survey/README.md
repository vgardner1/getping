# PING Survey — Production-Ready Next.js Application

A sleek, animated, interactive survey website for PING (smart NFC ring + network OS). Features a futuristic black-green aesthetic with orbiting nodes, glowing rings, and premium animations built with Next.js 14, TypeScript, and React Three Fiber.

## ✨ Features

- **8-Question Survey Flow** with conditional branching
- **3D Scene Animations** (React Three Fiber) with SVG fallback for low-end devices
- **Persistent State** — resume where you left off via localStorage
- **Waitlist Capture** with React Hook Form + Zod validation
- **Webhook Forwarding** to Airtable/Make/Zapier
- **Analytics Integration** with Google Analytics
- **Fully Accessible** — keyboard navigable, ARIA labels, focus management
- **Responsive Design** — mobile-first with touch-optimized interactions
- **Performance Optimized** — code splitting, lazy loading, reduced motion support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- (Optional) Airtable/Make webhook URL for submission forwarding
- (Optional) Google Analytics measurement ID

### Installation

```bash
# Navigate to project directory
cd ping-survey

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your webhook URL and GA ID (optional)
# AIRTABLE_WEBHOOK_URL=https://...
# GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
ping-survey/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with GA + Stars
│   ├── page.tsx             # Landing page
│   ├── survey/page.tsx      # 8-question survey flow
│   ├── thanks/page.tsx      # Thank you page with confetti
│   ├── privacy/page.tsx     # Privacy policy
│   ├── terms/page.tsx       # Terms of service
│   ├── api/submit/route.ts  # Submission API endpoint
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── SceneCanvas.tsx      # 3D scene with Three.js (+ SVG fallback)
│   ├── Stars.tsx            # Animated starfield background
│   ├── QuestionCard.tsx     # Question container with animations
│   ├── ChipSelect.tsx       # Single/multi-select chips
│   ├── Slider.tsx           # Accessible slider (1-5 scale)
│   ├── ProgressRing.tsx     # Survey progress indicator
│   ├── WaitlistForm.tsx     # Lead capture form with validation
│   └── Toast.tsx            # Notification toasts
├── config/
│   └── survey.ts            # Survey content & configuration (SINGLE SOURCE OF TRUTH)
├── lib/
│   ├── store.ts             # Zustand state management
│   ├── types.ts             # TypeScript types & Zod schemas
│   ├── utils.ts             # Utility functions
│   └── analytics.ts         # Google Analytics wrapper
├── public/                  # Static assets
├── .env.example             # Environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🎨 Customizing Survey Content

All survey questions, copy, and options are centralized in **`config/survey.ts`**.

### Editing Questions

```typescript
// config/survey.ts
export const SURVEY_CONFIG = {
  questions: [
    {
      id: 'q1',
      type: 'multi-select',
      title: "Your custom question?",
      description: "Choose up to 2.",
      maxSelect: 2,
      options: [
        { value: 'option1', label: 'Option 1', icon: '🎯' },
        { value: 'option2', label: 'Option 2', icon: '🚀' },
      ],
      animation: {
        type: 'node-highlight',
      },
    },
    // ... more questions
  ],
}
```

### Question Types

- `single-select` — Radio-style selection
- `multi-select` — Multiple choice with max limit
- `slider` — 1-5 scale with labels
- `waitlist-form` — Lead capture (must be last question)

### Animation Types

- `ring-glow` — Pulsing ring intensity
- `node-highlight` — Light up orbiting nodes
- `ripple` — Wave effect from center
- `orbit-speed` — Adjust rotation speed
- `core-pulse` — Bright center flash
- `edge-drawing` — Draw connections between nodes
- `ring-scale` — Scale ring size
- `zoom-out-orbit` — Camera zoom on completion

## 🔗 Webhook Integration

### Airtable Setup

1. Create an Airtable base with these fields:
   - `UUID` (Single line text)
   - `Email` (Email)
   - `Full Name` (Single line text)
   - `LinkedIn` (URL)
   - `Role` (Single select)
   - `Org` (Single line text)
   - `Q1-Q7` (as needed)
   - `Started At` (Date)
   - `Completed At` (Date)

2. Create an Airtable automation:
   - Trigger: "When webhook received"
   - Copy the webhook URL

3. Add to `.env`:
   ```
   AIRTABLE_WEBHOOK_URL=https://hooks.airtable.com/workflows/...
   ```

### Make.com / Zapier

Similar setup — create a webhook trigger and paste the URL into `.env`.

## 📊 Analytics

### Google Analytics Setup

1. Create a GA4 property
2. Get your measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env`:
   ```
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Events Tracked

- `survey_started` — User begins survey
- `question_answered` — Each question completion
- `survey_completed` — Full submission
- `waitlist_joined` — Lead captured
- `page_view` — Page navigation

## 🎯 Local Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Lint code
npm run lint

# Analyze bundle size
npm run analyze
```

### Viewing Submissions Locally

In development mode, submissions are saved to `data/submissions/<uuid>.json`. Check this folder to see test submissions.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables on Vercel

1. Go to Project Settings → Environment Variables
2. Add:
   - `AIRTABLE_WEBHOOK_URL` (optional)
   - `GA_MEASUREMENT_ID` (optional)
   - `NODE_ENV=production`

### Other Platforms

This app works on any platform supporting Next.js 14:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## ♿ Accessibility

- **Keyboard Navigation** — Tab through all interactive elements
- **Screen Reader Support** — Proper ARIA labels and roles
- **Focus Management** — Visible focus rings
- **Reduced Motion** — Respects `prefers-reduced-motion`
- **Color Contrast** — WCAG AA compliant

## 🎨 Design Tokens

Customize the color scheme in `tailwind.config.ts`:

```typescript
colors: {
  bg: '#0B0F0F',           // Deep black/green background
  ring: '#16FF88',         // Primary neon green
  'ring-soft': '#00E2A5',  // Secondary mint
  grid: '#0E1414',         // Subtle borders
  text: '#D6F5E8',         // Soft white-green text
  muted: '#7AE4C0',        // Muted text
}
```

## 🔧 Advanced Configuration

### Swap 3D to Spline/Lottie

Replace `components/SceneCanvas.tsx` with your Spline/Lottie component:

```tsx
// Example with Lottie
import Lottie from 'lottie-react'
import animationData from './ring-animation.json'

export function SceneCanvas({ config }) {
  return <Lottie animationData={animationData} loop />
}
```

### Add More Questions

1. Edit `config/survey.ts` — add new question object
2. Update `lib/types.ts` — add answer field to `SurveyAnswers`
3. Update `lib/store.ts` — add validation case in `isStepValid()`
4. Update `app/survey/page.tsx` — add handler in `handleAnswerChange()`

### Change Fonts

Update `app/layout.tsx`:

```typescript
import { Satoshi } from 'next/font/google'

const satoshi = Satoshi({
  subsets: ['latin'],
  variable: '--font-satoshi',
})
```

Then update `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ['var(--font-satoshi)', 'system-ui'],
}
```

## 🐛 Troubleshooting

### 3D Scene Not Rendering

- Check browser console for WebGL errors
- Verify Three.js dependencies are installed
- Low-end devices automatically fallback to SVG

### Submissions Not Forwarding

- Verify webhook URL is correct in `.env`
- Check Vercel/server logs for errors
- Test webhook URL with curl/Postman

### LocalStorage Not Persisting

- Ensure browser allows localStorage
- Check for incognito/private browsing mode
- Clear site data and try again

## 📝 Testing

### Manual Testing Checklist

- [ ] Complete full survey flow
- [ ] Test back button navigation
- [ ] Refresh mid-survey (should resume)
- [ ] Submit duplicate (should fail)
- [ ] Test on mobile/tablet
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Verify webhook receives data

### Playwright E2E (Future)

```bash
npm run test
```

## 📄 License

Proprietary — © 2024 PING. All rights reserved.

## 🤝 Support

For issues or questions:
- Email: support@getping.com
- GitHub Issues: (if repo is public)

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/) — React framework
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) — 3D graphics
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Zod](https://zod.dev/) — Schema validation
- [Tailwind CSS](https://tailwindcss.com/) — Styling

---

**Made with ❤️ for the PING community**
