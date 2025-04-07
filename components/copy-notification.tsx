"use client"

import { useEffect } from "react"
import { Check } from "lucide-react"

interface CopyNotificationProps {
  show: boolean
  onHide: () => void
}

export default function CopyNotification({ show, onHide }: CopyNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-in fade-in slide-in-from-bottom-5">
      <Check className="h-4 w-4" />
      <span className="text-sm font-medium">Copied to clipboard!</span>
    </div>
  )
}

