"use client"

import { Upload, BookOpen, ChevronRight, Sparkles, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TrainingPlanData } from "@/types/training-plan"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import Link from "next/link"
import TJsonTitle from "@/components/t-json-title"
import { FlickeringButton } from "./flickering-button"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  onLoadExample: () => void
  onImportData: (data: TrainingPlanData) => void
}

export default function WelcomeScreen({ onLoadExample, onImportData }: WelcomeScreenProps) {
  const uploadModalStore = useUploadModal()
  const aiInfoModalStore = useAiInfoModal()

  return (
    // Use h-full instead of min-h-screen to fill parent (<main>) height
    <div className="flex flex-col h-full">
      {/* This inner div uses flex-1 to grow within the h-full parent
          allowing items-center to vertically center the content block */}
      <div className="bg-primary/5 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        {/* Max-width container remains the same */}
        <div className="max-w-4xl mx-auto w-full">
          {/* Content structure remains the same... */}
          {/* Main Header */}
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="mb-4">
              <TJsonTitle />
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              JSON-based training plan visualization tool. Create, manage, and visualize your
              training plans easily with T-JSON.
            </p>
          </div>
          {/* Primary Call to Action */}
          <div className="mb-8 sm:mb-12 flex justify-center">
            <FlickeringButton
              size="lg"
              onClick={() => {
                aiInfoModalStore.open()
              }}
              className="w-full sm:w-auto sm:min-w-[320px] flex items-center justify-between py-4 sm:py-6 lg:py-8 px-6 text-base sm:text-lg shadow-md"
            >
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-3" />
                <span>Create AI-Powered Plan</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </FlickeringButton>
          </div>
          {/* Documentation Link */}
          <div className="text-center mb-6">
            <Link href="/documentation" passHref>
              <Button variant="link" className="text-primary">
                View Documentation <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          {/* Secondary Options */}
          <div className="text-center mb-6">
            <p className="text-base text-muted-foreground mb-4">
              Or start with a ready-made JSON plan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <Button
                onClick={() => {
                  // Don't pass the onImportData callback - we want to enter edit mode directly
                  uploadModalStore.open()
                }}
                variant="outline"
                className="h-14 text-base flex items-center justify-between w-full bg-sidebar/50"
              >
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  <span>Import JSON Plan</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Button>
              <Button
                onClick={onLoadExample}
                variant="outline"
                className="h-14 text-base flex items-center justify-between w-full bg-sidebar/50"
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>Load Example Plan</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Button>
            </div>
          </div>
          {/* Info Text Footer */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Use this tool to easily organize, visualize, and track your training plan whether it's
              created manually or generated with AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
