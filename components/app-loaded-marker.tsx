"use client"

import { useEffect, useState } from 'react'

export function AppLoadedMarker() {
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Mark as loaded after a short delay to ensure all other components have mounted
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isLoaded) return null
  
  return <div data-testid="app-loaded" className="sr-only">App loaded</div>
}
