"use client"

import { Upload, BookOpen, Info, FilePlus, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { TrainingPlanData } from "@/types/training-plan"
import { useUploadModal } from "@/components/modals/upload-modal"
import { useInfoModal } from "@/components/modals/info-modal"
import { useAiInfoModal } from "@/components/modals/ai-info-modal"
import { useNewPlanModal } from "@/components/modals/new-plan-modal"
import { useState, useEffect } from "react"

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
  const [debugInfo, setDebugInfo] = useState<string>("")
  
  // Get the store state directly to debug
  const uploadModalStore = useUploadModal()
  const infoModalStore = useInfoModal()
  const aiInfoModalStore = useAiInfoModal()
  const newPlanModalStore = useNewPlanModal()
  
  // For debugging, log the state of each modal store
  useEffect(() => {
    const storeState = {
      uploadModalOpen: uploadModalStore.isOpen,
      infoModalOpen: infoModalStore.isOpen,
      aiInfoModalOpen: aiInfoModalStore.isOpen,
      newPlanModalOpen: newPlanModalStore.isOpen,
    }
    setDebugInfo(JSON.stringify(storeState, null, 2))
  }, [
    uploadModalStore.isOpen, 
    infoModalStore.isOpen, 
    aiInfoModalStore.isOpen, 
    newPlanModalStore.isOpen
  ])
  
  const handleAiModalClick = () => {
    console.log("AI Modal Button Clicked")
    aiInfoModalStore.open()
    // Force update debug info
    setDebugInfo(prev => prev + " - AI button clicked")
  }
  
  const handleInfoModalClick = () => {
    console.log("Info Modal Button Clicked")
    infoModalStore.open()
    // Force update debug info
    setDebugInfo(prev => prev + " - Info button clicked")
  }
  
  const handleUploadModalClick = () => {
    console.log("Upload Modal Button Clicked")
    uploadModalStore.open(onImportData)
    // Force update debug info
    setDebugInfo(prev => prev + " - Upload button clicked")
  }
  
  const handleNewPlanModalClick = () => {
    console.log("New Plan Modal Button Clicked")
    
    // Create empty training plan structure
    const emptyPlan: TrainingPlanData = {
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: [],
    }
    
    newPlanModalStore.open((name: string) => {
      onCreateNewPlan(name, emptyPlan)
    })
    
    // Force update debug info
    setDebugInfo(prev => prev + " - New Plan button clicked")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-primary/5 py-12 px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto">
          {/* Debug Info (remove in production) */}
          <div className="fixed top-0 right-0 bg-black/80 text-white p-4 text-xs font-mono max-w-[300px] z-50 overflow-auto max-h-[300px]">
            <p>Debug Info:</p>
            <pre>{debugInfo}</pre>
          </div>
          
          {/* Main Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl mb-4">
              AI Träningsplan Visualiserare
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Det här verktyget hjälper dig att visualisera och hantera träningsplaner, särskilt de som skapats med AI.
            </p>
          </div>

          {/* Primary Call to Action */}
          <div className="mb-12 flex justify-center">
            <Button 
              onClick={handleAiModalClick}
              size="lg"
              className="w-full sm:w-auto sm:min-w-[320px] flex items-center justify-between py-8 px-6 text-lg shadow-md"
            >
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-3" />
                <span>Skapa Träningsplan med AI</span>
              </div>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </Button>
          </div>

          {/* Secondary Options */}
          <div className="text-center mb-6">
            <p className="text-base text-muted-foreground mb-4">Eller börja med en befintlig plan:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <Button
                onClick={handleUploadModalClick}
                variant="outline"
                className="h-14 text-base flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  <span>Importera Plan</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Button>

              <Button
                onClick={onLoadExample}
                variant="outline"
                className="h-14 text-base flex items-center justify-between"
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>Ladda Exempelplan</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Button>
            </div>
          </div>

          {/* Additional Options in Cards */}
          <Card className="mt-8 border border-primary/10 bg-background/60 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleNewPlanModalClick}
                  variant="ghost"
                  className="h-12 justify-start"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  <span>Skapa Manuellt</span>
                </Button>

                <Button 
                  onClick={handleInfoModalClick} 
                  variant="ghost"
                  className="h-12 justify-start"
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span>Format & Information</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Text Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Använd detta verktyg för att enkelt organisera, visualisera och följa 
              din träningsplan oavsett om den skapas manuellt eller genereras med AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}