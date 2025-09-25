"use client"

import { useCallback, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import PixelBlast from '@/components/ui/pixel-blast'
import { TextScramble } from '@/components/ui/text-scramble'

interface ContactSectionProps {
  className?: string
}

export default function ContactSection({ className = '' }: ContactSectionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)

    if (!hasTriggered) {
      setHasTriggered(true)
      setShouldTriggerScramble(true)

      scrambleTimeoutRef.current = setTimeout(() => {
        setShouldTriggerScramble(false)
      }, 800)
    }
  }, [hasTriggered])

  const handleMouseLeave = useCallback(() => {
    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current)
    }
    setIsHovered(false)
    setShouldTriggerScramble(false)
    setHasTriggered(false)
  }, [])

  const handleScrambleComplete = useCallback(() => {
    setShouldTriggerScramble(false)
  }, [])

  useEffect(() => {
    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current)
      }
    }
  }, [])

  return (
    <section
      className={`h-[60vh] relative flex items-center justify-center p-8 bg-black ${className}`}
      aria-label="Contact call-to-action section"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <PixelBlast
          className="w-full h-full"
          variant="circle"
          pixelSize={4}
          color="primary"
          patternScale={3}
          patternDensity={0.6}
          enableRipples={true}
          rippleIntensityScale={1.2}
          rippleSpeed={0.4}
          edgeFade={0.3}
          liquid={true}
          liquidStrength={0.08}
          transparent={true}
        />
      </div>
      <div className="relative z-10 text-center max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-light text-white tracking-wide drop-shadow-2xl">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 sm:gap-4 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
            aria-label="Navigate to contact page to discuss your project"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.span
              className={`inline-block relative border-b transition-colors duration-300 ${
                isHovered ? 'border-primary' : 'border-transparent'
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.8}
                speed={0.04}
                onScrambleComplete={handleScrambleComplete}
                as="span"
              >
                Let&apos;s discuss
              </TextScramble>
            </motion.span>
            <motion.span
              className="inline-block relative"
              initial={{ scale: 0, width: 0 }}
              animate={{
                scale: isHovered ? 1 : 0,
                width: isHovered ? 'auto' : 0,
              }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              style={{ overflow: 'hidden' }}
            >
              <Image
                src="/cta-gif.gif"
                alt=""
                width={64}
                height={64}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 object-contain"
                priority={false}
                unoptimized
              />
            </motion.span>
            <motion.span
              className={`inline-block relative border-b transition-colors duration-300 ${
                isHovered ? 'border-primary' : 'border-transparent'
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.8}
                speed={0.04}
                onScrambleComplete={handleScrambleComplete}
                as="span"
              >
                your project
              </TextScramble>
            </motion.span>
            <motion.span
              animate={{
                x: isHovered ? 4 : 0,
                y: isHovered ? -4 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="inline-block ml-2 sm:ml-4"
            >
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </motion.span>
          </Link>
        </h2>
      </div>
    </section>
  )
}