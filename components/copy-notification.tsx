"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"

interface CopyNotificationProps {
  show: boolean
  onHide: () => void
  success?: boolean
  message?: string
}

export default function CopyNotification({ 
  show, 
  onHide, 
  success = true, 
  message 
}: CopyNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null
  
  const defaultMessage = success ? "Copied to clipboard!" : "Failed to copy!"
  const displayMessage = message || defaultMessage

  return (
    <div className={`fixed bottom-4 right-4 ${success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50 animate-in fade-in slide-in-from-bottom-5`}>
      {success ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">{displayMessage}</span>
    </div>
  )
}
