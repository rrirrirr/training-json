"use client"

import { useEffect } from "react"
import { Bot, Check, Copy } from "lucide-react"

interface CopyForAINotificationProps {
  show: boolean
  onHide: () => void
  success?: boolean
}

export default function CopyForAINotification({ 
  show, 
  onHide, 
  success = true 
}: CopyForAINotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide()
      }, 3000) // Slightly longer duration for this notification

      return () => clearTimeout(timer)
    }
  }, [show, onHide])

  if (!show) return null

  return (
    <div className={`fixed bottom-4 right-4 ${success ? 'bg-primary/10 text-primary-foreground' : 'bg-red-100 text-red-800'} px-4 py-3 rounded-md shadow-md z-50 animate-in fade-in slide-in-from-bottom-5 max-w-md`}>
      <div className="flex items-center gap-2 mb-1">
        {success ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {success ? "Copied JSON & documentation for AI help!" : "Failed to copy!"}
        </span>
      </div>
      {success && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Bot className="h-3 w-3" />
          Paste this to an AI assistant like ChatGPT or Claude for help fixing your JSON
        </p>
      )}
    </div>
  )
}
