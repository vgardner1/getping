import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Stars } from '@/components/Stars'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PING Survey — Visualize Your Circle',
  description: 'Join the waitlist for PING, the smart NFC ring that brings your connections full circle.',
  keywords: ['networking', 'NFC ring', 'smart ring', 'connections', 'waitlist'],
  authors: [{ name: 'PING' }],
  openGraph: {
    title: 'PING Survey — Visualize Your Circle',
    description: 'Join the waitlist for PING, the smart NFC ring that brings your connections full circle.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PING Survey — Visualize Your Circle',
    description: 'Join the waitlist for PING, the smart NFC ring that brings your connections full circle.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Analytics */}
        {process.env.GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen overflow-x-hidden">
        {/* Animated starfield background */}
        <Stars />

        {/* Main content */}
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}
