"use client"

import { useTheme } from "next-themes"
import { Toaster as SonnerPrimitive } from "sonner" // Renamed to avoid conflict
import { createPortal } from "react-dom" // Import createPortal
import React, { useEffect, useState } from "react" // Import useEffect and useState

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // Ensure this only runs on the client
  }, [])

  const toasterContent = (
    <SonnerPrimitive
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto", // Added pointer-events-auto here as well
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )

  if (!mounted || typeof window === "undefined") {
    // Return null on the server or before mounted to avoid SSR issues with portals
    return null
  }

  // Use createPortal to render the toaster directly into the document.body
  return createPortal(toasterContent, document.body)
}

export { Toaster }
