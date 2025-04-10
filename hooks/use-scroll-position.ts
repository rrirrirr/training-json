"use client"

import { useState, useEffect } from "react"

interface ScrollPositionState {
  scrollY: number
  isHeaderVisible: boolean
  direction: 'up' | 'down' | null
  lastScrollY: number
}

/**
 * Custom hook to track scroll position and header visibility
 * @param headerHeight - The height of the header in pixels (default: 56)
 * @returns Object containing scrollY, isHeaderVisible, and scroll direction
 */
export function useScrollPosition(headerHeight: number = 56): ScrollPositionState {
  const [scrollState, setScrollState] = useState<ScrollPositionState>({
    scrollY: 0,
    isHeaderVisible: true,
    direction: null,
    lastScrollY: 0
  })

  useEffect(() => {
    // Skip effects during SSR
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const previousScrollY = scrollState.lastScrollY
      
      // Determine scroll direction
      const scrollingDown = currentScrollY > previousScrollY
      const direction = scrollingDown ? 'down' : 'up'
      
      // Determine if header is visible
      // When scrolling up or at the top of the page, header is visible
      const isHeaderVisible = !scrollingDown || currentScrollY <= headerHeight

      setScrollState({
        scrollY: currentScrollY,
        isHeaderVisible,
        direction,
        lastScrollY: currentScrollY
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollState.lastScrollY, headerHeight])

  return scrollState
}
