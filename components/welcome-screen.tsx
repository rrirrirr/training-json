// /components/welcome-screen.tsx
"use client"

import { Upload, BookOpen, ChevronRight, Sparkles, ExternalLink, Loader2 } from "lucide-react" // Added Loader2 for completeness if other buttons use it
import { Button } from "@/components/ui/button"
import type { TrainingPlanData } from "@/types/training-plan"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import Link from "next/link" // Import Link
import TJsonTitle from "@/components/t-json-title"
import { FlickeringButton } from "./flickering-button"
import { cn } from "@/lib/utils"
// Removed useState for isLoadingExample

// Define the constant ID for the example plan
const EXAMPLE_PLAN_ID = "00000000-0000-0000-0000-000000000001"

interface WelcomeScreenProps {
  // onLoadExample: () => void; // Prop no longer needed
  onImportData: (data: TrainingPlanData) => void
}

export default function WelcomeScreen({ onImportData }: WelcomeScreenProps) {
  // Removed onLoadExample from props
  const uploadModalStore = useUploadModal()
  const aiInfoModalStore = useAiInfoModal()
  // Removed isLoadingExample state

  return (
    <div className="flex flex-col h-full">
      <div className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="mb-4">
              <TJsonTitle />
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              JSON-based training plan visualization tool. Create, manage, and visualize your
              training plans easily with T-JSON.
            </p>
          </div>
          <div className="mb-8 sm:mb-12 flex justify-center">
            <FlickeringButton
              size="lg"
              onClick={() => {
                aiInfoModalStore.open()
              }}
              className="italic font-bold text-primary font-oswald uppercase w-full sm:w-auto sm:min-w-[320px] flex items-center justify-center py-4 sm:py-6 lg:py-8 px-6 text-base sm:text-xl shadow-md"
            >
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-3" />
                <span>Create AI-Powered Plan</span>
              </div>
            </FlickeringButton>
          </div>
          <div className="text-center mb-6">
            <Link href="/documentation" passHref legacyBehavior>
              <Button variant="link" className="text-primary" asChild>
                <a>
                  {/* Added <a> for legacyBehavior with asChild */}
                  View Documentation <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </Link>
          </div>
          <div className="text-center mb-6">
            <p className="text-base text-muted-foreground mb-4">
              Or start with a ready-made JSON plan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <Button
                onClick={() => {
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
              {/* Updated "Load Example Plan" to use Next.js Link */}
              <Link href={`/plan/${EXAMPLE_PLAN_ID}`} passHref legacyBehavior>
                <Button
                  asChild // Important: Allows Button to act as the Link's child
                  variant="outline"
                  className="h-14 text-base flex items-center justify-between w-full bg-sidebar/50"
                >
                  <a>
                    {/* Content of the link/button */}
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span>Load Example Plan</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </a>
                </Button>
              </Link>
            </div>
          </div>
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
