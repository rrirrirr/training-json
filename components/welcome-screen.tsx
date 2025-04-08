"use client"

import { Upload, BookOpen, Info, Cpu, FilePlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TrainingPlanData } from "@/types/training-plan"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useInfoModal } from "@/components/modals/info-modal"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"

interface WelcomeScreenProps {
  onLoadExample: () => void
  onImportData: (data: TrainingPlanData) => void
  onCreateNewPlan: (name: string, emptyPlan: TrainingPlanData) => void
}

export default function WelcomeScreen({
  onLoadExample,
  onImportData,
  onCreateNewPlan,
}: WelcomeScreenProps) {
  const { open: openUploadModal } = useUploadModal()
  const { open: openInfoModal } = useInfoModal()
  const { open: openAiInfoModal } = useAiInfoModal()
  const { open: openNewPlanModal } = useNewPlanModal()

  const handleNewPlan = (name: string) => {
    // Create empty training plan structure
    const emptyPlan: TrainingPlanData = {
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: [],
    }
    onCreateNewPlan(name, emptyPlan)
  }

  return (
    <div className="flex flex-col min-h-screen w-screen">
      {/* Hero Section */}
      <div className="bg-primary/5 py-12 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl mb-4">
              Träningsplan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hantera dina träningsplaner enkelt och effektivt. Skapa, redigera och följ din
              träningsutveckling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Kom igång snabbt</CardTitle>
                <CardDescription>Ladda ett exempel eller skapa en ny träningsplan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={onLoadExample}
                  variant="default"
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    <span>Ladda exempelplan</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>

                <Button
                  onClick={() => openNewPlanModal(handleNewPlan)}
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <FilePlus className="h-5 w-5 mr-2" />
                    <span>Skapa ny träningsplan</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Importera & Lär mer</CardTitle>
                <CardDescription>
                  Importera en befintlig plan eller utforska funktioner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => openUploadModal(onImportData)}
                  variant="default"
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    <span>Importera träningsplan</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => openAiInfoModal()} variant="outline" className="w-full">
                    <Cpu className="h-4 w-4 mr-2" />
                    <span>AI hjälp</span>
                  </Button>

                  <Button onClick={() => openInfoModal()} variant="outline" className="w-full">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Info</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Träningsplan är ett verktyg för att hjälpa dig följa din träningsutveckling och hålla
              koll på dina träningsplaner.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
