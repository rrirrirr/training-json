"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { useParticleEffect } from "@/hooks/use-particle-effect"
import { cn } from "@/lib/utils" // Assuming you use shadcn utils
import { useRef } from "react"

// Extend ButtonProps and add specific props if needed
interface FlickeringButtonProps extends ButtonProps {}

export function FlickeringButton({ children, className, ...props }: FlickeringButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Use the hook, passing the button ref as the target
  const canvasRef = useParticleEffect(buttonRef)

  return (
    // Wrapper div to position canvas relative to button
    <div className="relative inline-block">
      {/* Canvas positioned absolutely, centered on the button */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
        // Width/height set by the hook's resizeCanvas
        aria-hidden="true"
      />
      {/* The actual button, rendered normally, above canvas */}
      <Button
        ref={buttonRef}
        className={cn("relative z-10", className)} // Ensure button is above canvas
        {...props} // Pass down all other button props
      >
        {/* Span inside button to apply flicker to text only */}
        <span style={{ animation: "flicker 0.3s infinite alternate" }}>{children}</span>
      </Button>

      {/* Flicker animation definition - scoped if not global */}
      {/* Using style tag here for simplicity, could be global CSS */}
      <style jsx>{`
        @keyframes flicker {
          0%,
          100% {
            color: #ff4500;
            text-shadow:
              0 0 5px rgba(255, 69, 0, 0.6),
              0 0 15px rgba(255, 69, 0, 0.4),
              0 0 30px rgba(255, 140, 0, 0.3);
          }
          50% {
            color: #ff8c00;
            text-shadow:
              0 0 8px rgba(255, 140, 0, 0.7),
              0 0 20px rgba(255, 140, 0, 0.5),
              0 0 40px rgba(255, 69, 0, 0.3);
          }
        }
        /* Ensure flicker animation has initial color if needed */
        span[style*="animation: flicker"] {
          color: #ff4500;
        }
      `}</style>
    </div>
  )
}
