"use client"

import { useEffect, useState, Suspense } from "react"
import { usePlanStore } from "@/store/plan-store"
import { TrainingPlanData } from "@/types/training-plan"
import pako from "pako"
import { Buffer } from "buffer"
import { Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

function CompressedPlanRedirector() {
  const router = useRouter()
  const params = useParams()
  const compressed = params?.compressed as string
  const setDraftPlan = usePlanStore((state) => state._setModeState)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (compressed) {
      try {
        // 1. Manually and fully decode the URL component
        const decodedCompressed = decodeURIComponent(compressed)

        // 2. Convert from base64url to standard base64
        let base64 = decodedCompressed.replace(/-/g, "+").replace(/_/g, "/")

        // 3. Add back any missing padding
        const padding = base64.length % 4
        if (padding) {
          base64 += "=".repeat(4 - padding)
        }

        // 4. Decode the corrected base64 string
        const base64Decoded = Buffer.from(base64, "base64")

        // 5. Decompress with pako
        const decompressed = pako.inflate(base64Decoded, { to: "string" })
        const jsonData: TrainingPlanData = JSON.parse(decompressed)

        // Set the store to view mode with the decompressed data
        setDraftPlan("view", jsonData, null, false)

        // Redirect to the view page
        router.replace("/create")
      } catch (e: any) {
        setError("Failed to decompress or parse the training plan link. The link may be invalid.")
        console.error(e)
      }
    } else {
      setError("No compressed data found in the URL.")
    }
  }, [compressed, setDraftPlan, router])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Processing Link</h2>
          <p className="text-foreground/80 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Preparing your training plan...</p>
    </div>
  )
}

export default function CompressedPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CompressedPlanRedirector />
    </Suspense>
  )
}
