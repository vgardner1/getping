'use client'

/**
 * Thank You Page (/thanks)
 *
 * Confirmation with "You are node #XXXX" feel, confetti pulse, social share
 */

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSurveyStore } from '@/lib/store'
import { SceneCanvas } from '@/components/SceneCanvas'
import { trackPageView, trackWaitlistJoined } from '@/lib/analytics'

export default function ThanksPage() {
  const router = useRouter()
  const { uuid, isSubmitted, getAnswer } = useSurveyStore()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    trackPageView('/thanks', 'Thank You')

    const lead = getAnswer('lead')
    if (lead?.email) {
      trackWaitlistJoined(lead.email)
    }

    // Redirect if not submitted
    if (!isSubmitted) {
      router.push('/survey')
    }
  }, [isSubmitted, router, getAnswer])

  if (!mounted || !isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ring/30 border-t-ring rounded-full animate-spin" />
      </div>
    )
  }

  // Generate a pseudo "node number" from UUID
  const nodeNumber = parseInt(uuid.replace(/\D/g, '').slice(0, 4), 10)

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareText = `I just joined the PING waitlist! Be first to wear the smart ring that brings connections full circle.`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Confetti effect */}
      <ConfettiNodes />

      {/* 3D Scene Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <div className="w-full h-full max-w-4xl">
          <SceneCanvas config={{ intensity: 1.5, successPulse: true }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-ring/20 border-4 border-ring shadow-2xl shadow-ring/50">
            <svg className="w-12 h-12 text-ring" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-text mb-4"
        >
          You're on the list!
        </motion.h1>

        {/* Node number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-muted text-lg mb-2">You are node</p>
          <p className="text-5xl md:text-6xl font-bold text-ring tracking-tight">
            #{nodeNumber.toString().padStart(4, '0')}
          </p>
        </motion.div>

        {/* Success message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text text-lg mb-12"
        >
          {SURVEY_CONFIG.copy.success}
        </motion.p>

        {/* Share section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted mb-4">Share with your circle</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="px-6 py-3 rounded-lg bg-bg border-2 border-grid hover:border-ring text-text font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>

            {/* Twitter */}
            <button
              onClick={handleShareTwitter}
              className="px-6 py-3 rounded-lg bg-bg border-2 border-grid hover:border-ring text-text font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
            >
              𝕏 Share on X
            </button>

            {/* LinkedIn */}
            <button
              onClick={handleShareLinkedIn}
              className="px-6 py-3 rounded-lg bg-bg border-2 border-grid hover:border-ring text-text font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
            >
              💼 Share on LinkedIn
            </button>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <button
            onClick={() => router.push('/')}
            className="text-muted hover:text-ring transition-colors underline text-sm"
          >
            ← Back to home
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================================
// Confetti Nodes Component
// ============================================================================

function ConfettiNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create mini node particles
    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      life: number
    }

    const particles: Particle[] = []
    const particleCount = 50

    // Initialize particles at center
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = Math.random() * 3 + 2

      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Upward bias
        size: Math.random() * 6 + 4,
        opacity: 1,
        life: 1,
      })
    }

    // Animation loop
    let frame = 0
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        // Update
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1 // Gravity
        p.life -= 0.01
        p.opacity = Math.max(0, p.life)

        if (p.life <= 0) return

        // Draw particle (mini green node)
        ctx.save()
        ctx.globalAlpha = p.opacity

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        gradient.addColorStop(0, '#16FF88')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Core node
        ctx.fillStyle = '#16FF88'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      })

      frame++
      if (frame < 180) {
        // Run for ~3 seconds
        requestAnimationFrame(animate)
      }
    }

    // Start after a brief delay
    setTimeout(animate, 300)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  )
}

// Import survey config for copy
import { SURVEY_CONFIG } from '@/config/survey'
