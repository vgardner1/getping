'use client'

/**
 * Privacy Policy Page
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { trackPageView } from '@/lib/analytics'

export default function PrivacyPage() {
  useEffect(() => {
    trackPageView('/privacy', 'Privacy Policy')
  }, [])

  return (
    <div className="relative min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ring transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert max-w-none"
        >
          <h1 className="text-4xl font-bold text-text mb-6">Privacy Policy</h1>
          <p className="text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-text/90">
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Introduction</h2>
              <p>
                PING ("we," "our," or "us") is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, and safeguard your personal information when
                you participate in our survey and join our waitlist.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Information We Collect</h2>
              <p>We collect the following information when you complete our survey:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Full name and email address</li>
                <li>LinkedIn profile URL (optional)</li>
                <li>Professional role and organization (optional)</li>
                <li>Your responses to survey questions about networking preferences</li>
                <li>Technical information (browser type, device, timestamp, timezone)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Notify you about early access to PING</li>
                <li>Understand user needs and improve our product</li>
                <li>Analyze survey responses to guide product development</li>
                <li>Send occasional updates about PING (you can unsubscribe anytime)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Data Storage and Security</h2>
              <p>
                Your data is securely stored and protected. We use industry-standard encryption and
                security measures. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access your personal data</li>
                <li>Request correction of your data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of communications at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Contact Us</h2>
              <p>
                For privacy concerns or data requests, please contact us at{' '}
                <a href="mailto:privacy@getping.com" className="text-ring hover:underline">
                  privacy@getping.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
