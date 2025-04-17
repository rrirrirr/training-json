"use client"

// Assuming these imports and the hook are correctly set up
import React, { useEffect, useRef, useState, RefObject } from "react"
import { Button, ButtonProps } from "@/components/ui/button" // Adjust import path
import { cn } from "@/lib/utils" // Adjust import path
import { useParticleEffect } from "@/hooks/use-particle-effect" // Adjust import path
// Make sure all the simulation classes and helpers are available, either here or imported by the hook

// --- FlickeringButton Component ---
interface FlickeringButtonProps extends ButtonProps {}

export function FlickeringButton({ children, className, style, ...props }: FlickeringButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Use the particle effect hook, targeting the button element
  const canvasRef = useParticleEffect(buttonRef)

  return (
    // Wrapper div to position the canvas relative to the button
    <div className="relative inline-block">
      {/* The particle canvas, positioned absolutely and centered */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
        // Width/height are set internally by the useParticleEffect hook
        aria-hidden="true"
      />
      {/* The actual Button component */}
      <Button
        ref={buttonRef}
        className={cn(
          "relative z-10", // Ensures button is rendered above the canvas
          // Add base styling if needed - animation might override defaults
          // e.g., "text-primary-foreground",
          className
        )}
        // Apply the background flicker animation via inline style
        style={{
          // Use a new animation name for background flicker
          animation: "ButtonBackgroundFlicker 0.5s infinite alternate", // Slower duration might look better for bg
          // Set a default background to avoid flickering from transparent if button variant is 'ghost' or 'link'
          backgroundColor: "#ff6347", // Match one of the keyframe colors
          ...style, // Merge any other passed styles
        }}
        {...props} // Pass down standard button props (onClick, size, variant, etc.)
      >
        {/* Render children directly - no extra span needed now */}
        {children}
      </Button>

      {/* Keyframes for the BACKGROUND flicker animation */}
      {/* Use style jsx for scoped CSS, or define globally */}
      <style jsx>{`
        @keyframes ButtonBackgroundFlicker {
          0%,
          100% {
            /* Animate background-color and box-shadow for glow */
            background-color: #ff6347; /* Lighter orange-red */
            /* Adjust shadow to match desired glow */
            box-shadow:
              0 0 8px rgba(255, 69, 0, 0.6),
              0 0 15px rgba(255, 140, 0, 0.4);
          }
          50% {
            background-color: #ff8c00; /* Darker orange */
            box-shadow:
              0 0 12px rgba(255, 140, 0, 0.7),
              0 0 25px rgba(255, 69, 0, 0.5);
          }
        }
      `}</style>
    </div>
  )
}
