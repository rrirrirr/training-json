"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Info, Upload, Cpu, BookOpen, FilePlus } from "lucide-react"
import JsonUploadModal from "./json-upload-modal"
import JsonInfoModal from "./json-info-modal"
import PlanNameDialog from "./plan-name-dialog"
import PlanSelector from "./plan-selector"
import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"
import { useTrainingPlans } from "@/contexts/training-plan-context"

interface AppHeaderProps {
  onImportData: (data: TrainingPlanData) => void
}

export default function AppHeader({ onImportData }: AppHeaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAiInfoModalOpen, setIsAiInfoModalOpen] = useState(false)
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<TrainingPlanData | null>(null)

  const { addPlan } = useTrainingPlans()

  const handleLoadExample = () => {
    setPendingImportData(exampleTrainingPlan)
    setIsNewPlanModalOpen(true)
  }

  const handleImportData = (data: TrainingPlanData) => {
    setPendingImportData(data)
    setIsNewPlanModalOpen(true)
  }

  const handleNewPlanClick = () => {
    // Create empty training plan structure
    const emptyPlan = {
      exerciseDefinitions: [],
      weeks: [],
      monthBlocks: [],
    }
    setPendingImportData(emptyPlan)
    setIsNewPlanModalOpen(true)
  }

  const handleSavePlanName = (name: string) => {
    if (pendingImportData) {
      // Add to context
      addPlan(name, pendingImportData)

      // Also call the original onImportData to maintain existing functionality
      onImportData(pendingImportData)

      // Clear pending data
      setPendingImportData(null)
    }
  }

  // Listen for new plan event from sidebar
  useEffect(() => {
    const handleNewPlanEvent = () => {
      setIsNewPlanModalOpen(true)
    }

    window.addEventListener("new-training-plan", handleNewPlanEvent)

    return () => {
      window.removeEventListener("new-training-plan", handleNewPlanEvent)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Träningsplan</h1>
        <PlanSelector />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleNewPlanClick}>
          <FilePlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New Plan</span>
        </Button>

        <Button variant="outline" size="sm" onClick={handleLoadExample}>
          <BookOpen className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Load Example</span>
        </Button>

        <Button variant="outline" size="sm" onClick={() => setIsAiInfoModalOpen(true)}>
          <Cpu className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Generate with AI</span>
        </Button>

        <Button variant="outline" size="sm" onClick={() => setIsInfoModalOpen(true)}>
          <Info className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Info</span>
        </Button>

        <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Import Plan</span>
        </Button>
      </div>

      {/* Modals */}
      <JsonUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImport={handleImportData}
      />

      <JsonInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      <JsonInfoModal
        isOpen={isAiInfoModalOpen}
        onClose={() => setIsAiInfoModalOpen(false)}
        defaultTab="ai"
      />

      <PlanNameDialog
        isOpen={isNewPlanModalOpen}
        onClose={() => {
          setIsNewPlanModalOpen(false)
          setPendingImportData(null)
        }}
        onSave={handleSavePlanName}
        title="Name Your Training Plan"
        description="Give your training plan a name that helps you identify it later."
      />
    </header>
  )
}
