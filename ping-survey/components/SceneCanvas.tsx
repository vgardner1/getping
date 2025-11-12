'use client'

/**
 * 3D Scene Canvas with React Three Fiber
 *
 * Central glowing ring with orbiting nodes. Falls back to SVG on low-end devices.
 */

import { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion, isLowEndDevice } from '@/lib/utils'
import { SceneConfig } from '@/lib/types'

// ============================================================================
// 3D Components
// ============================================================================

function Ring({ intensity = 1, scale = 1 }: { intensity?: number; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Slow rotation
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    meshRef.current.rotation.y += 0.003
  })

  return (
    <mesh ref={meshRef} scale={scale}>
      <torusGeometry args={[2, 0.15, 16, 100]} />
      <meshStandardMaterial
        color="#16FF88"
        emissive="#16FF88"
        emissiveIntensity={intensity * 0.8}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function OrbitingNodes({
  count = 5,
  highlightIndices = [],
}: {
  count?: number
  highlightIndices?: number[]
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z += 0.002
  })

  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const radius = 3.5
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const isHighlighted = highlightIndices.includes(i)

    return (
      <mesh key={i} position={[x, y, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={isHighlighted ? '#16FF88' : '#00E2A5'}
          emissive={isHighlighted ? '#16FF88' : '#00E2A5'}
          emissiveIntensity={isHighlighted ? 1.5 : 0.5}
        />
      </mesh>
    )
  })

  return <group ref={groupRef}>{nodes}</group>
}

function Scene({ config }: { config: SceneConfig }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Ring intensity={config.intensity} scale={config.ringScale} />
      <OrbitingNodes highlightIndices={config.highlightIndices} />
    </>
  )
}

// ============================================================================
// SVG Fallback
// ============================================================================

function SVGFallback({ config }: { config: SceneConfig }) {
  const isReduced = prefersReducedMotion()

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ringGlow">
          <stop offset="0%" stopColor="#16FF88" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#16FF88" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Central ring */}
      <circle
        cx="200"
        cy="200"
        r="80"
        fill="none"
        stroke="#16FF88"
        strokeWidth="6"
        filter="url(#glow)"
        opacity={config.intensity || 1}
        className={isReduced ? '' : 'animate-pulse-glow'}
      />
      <circle
        cx="200"
        cy="200"
        r="80"
        fill="url(#ringGlow)"
        opacity="0.2"
      />

      {/* Orbiting nodes */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
        const radius = 120
        const x = 200 + Math.cos(angle) * radius
        const y = 200 + Math.sin(angle) * radius
        const isHighlighted = config.highlightIndices?.includes(i)

        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={isHighlighted ? '8' : '5'}
              fill={isHighlighted ? '#16FF88' : '#00E2A5'}
              filter="url(#glow)"
              opacity={isHighlighted ? '1' : '0.7'}
              className={!isReduced && isHighlighted ? 'animate-pulse-glow' : ''}
            />
            {/* Connection line to center */}
            {isHighlighted && (
              <line
                x1={x}
                y1={y}
                x2="200"
                y2="200"
                stroke="#16FF88"
                strokeWidth="1"
                opacity="0.4"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ============================================================================
// Main Export
// ============================================================================

export function SceneCanvas({ config = {} }: { config?: SceneConfig }) {
  const [use3D, setUse3D] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if we should use fallback
    if (isLowEndDevice() || prefersReducedMotion()) {
      setUse3D(false)
    }
  }, [])

  const finalConfig: SceneConfig = {
    intensity: 1,
    highlightIndices: [],
    successPulse: false,
    ringScale: 1,
    ...config,
  }

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border-2 border-ring/30 animate-pulse" />
      </div>
    )
  }

  if (!use3D) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-[400px] h-[400px]">
          <SVGFallback config={finalConfig} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene config={finalConfig} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
