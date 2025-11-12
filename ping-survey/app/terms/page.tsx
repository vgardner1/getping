'use client'

/**
 * Terms of Service Page
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { trackPageView } from '@/lib/analytics'

export default function TermsPage() {
  useEffect(() => {
    trackPageView('/terms', 'Terms of Service')
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
          <h1 className="text-4xl font-bold text-text mb-6">Terms of Service</h1>
          <p className="text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-text/90">
            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Agreement to Terms</h2>
              <p>
                By participating in the PING survey and joining our waitlist, you agree to these
                Terms of Service. If you do not agree, please do not complete the survey.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Waitlist Participation</h2>
              <p>
                Joining the waitlist does not guarantee early access or purchase of PING products.
                We reserve the right to invite users based on our rollout strategy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Survey Responses</h2>
              <p>
                By submitting survey responses, you grant PING permission to use your aggregated,
                anonymized responses for product research and development. Individual responses will
                not be shared publicly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Communications</h2>
              <p>
                By providing your email address, you consent to receive communications from PING
                about product updates, launch notifications, and related information. You may
                unsubscribe at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Intellectual Property</h2>
              <p>
                All content, branding, and materials related to PING are the property of PING and
                protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Limitation of Liability</h2>
              <p>
                PING is provided "as is" without warranties. We are not liable for any damages
                arising from your use of this survey or participation in the waitlist.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Changes to Terms</h2>
              <p>
                We may update these Terms at any time. Continued participation after updates
                constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text mb-4">Contact</h2>
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:legal@getping.com" className="text-ring hover:underline">
                  legal@getping.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
