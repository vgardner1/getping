'use client'

/**
 * Animated Starfield Background
 *
 * Lightweight particle shimmer effect with parallax drift
 */

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/utils'

type StarParticle = {
  x: number
  y: number
  radius: number
  opacity: number
  vx: number
  vy: number
}

export function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<StarParticle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isReduced = prefersReducedMotion()

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particleCount = isReduced ? 50 : 100
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }))

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        if (!isReduced) {
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(214, 245, 232, ${particle.opacity})`
        ctx.fill()

        // Subtle glow
        if (!isReduced && particle.opacity > 0.5) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(22, 255, 136, ${particle.opacity * 0.1})`
          ctx.fill()
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
