'use client'

/**
 * Landing Page (/)
 *
 * "Visualize my circle" landing with central glowing ring
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SceneCanvas } from '@/components/SceneCanvas'
import { trackPageView } from '@/lib/analytics'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    trackPageView('/', 'Home')
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <div className="w-full h-full max-w-3xl max-h-3xl">
          <SceneCanvas config={{ intensity: 1.2 }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        {/* Logo/Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-ring mb-4 tracking-tight">
            PING
          </h1>
          <p className="text-xl md:text-2xl text-text font-medium">
            Where connections come full circle
          </p>
        </motion.div>

        {/* Search bar style callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center gap-4 px-6 py-4 bg-bg/80 backdrop-blur-sm border-2 border-grid rounded-full shadow-2xl shadow-ring/10">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ring/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-ring animate-pulse-glow" />
              </div>
              <p className="text-muted text-lg">
                Grow your circle. Never lose touch.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.push('/survey')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-12 py-5 bg-ring text-bg font-bold text-xl rounded-full shadow-2xl shadow-ring/30 transition-all duration-300 hover:shadow-ring/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg"
          >
            <span className="relative z-10">Start Survey</span>
            <motion.div
              className="absolute inset-0 rounded-full bg-ring-soft opacity-0 group-hover:opacity-20 transition-opacity"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.button>
        </motion.div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-sm text-muted"
        >
          every circle is a connection — click to explore
        </motion.p>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 flex gap-6 justify-center text-sm text-muted"
        >
          <Link
            href="/privacy"
            className="hover:text-ring transition-colors underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-ring transition-colors underline"
          >
            Terms
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
