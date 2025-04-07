"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Info, Upload, Cpu, BookOpen } from "lucide-react"
import JsonUploadModal from "./json-upload-modal"
import JsonInfoModal from "./json-info-modal"
import type { TrainingPlanData } from "@/types/training-plan"
import { exampleTrainingPlan } from "@/utils/example-training-plan"

interface AppHeaderProps {
  onImportData: (data: TrainingPlanData) => void
}

export default function AppHeader({ onImportData }: AppHeaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isAiInfoModalOpen, setIsAiInfoModalOpen] = useState(false)

  const handleLoadExample = () => {
    onImportData(exampleTrainingPlan)
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Träningsplan</h1>
      </div>

      <div className="flex gap-2">
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

      <JsonUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onImport={onImportData} />

      <JsonInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      <JsonInfoModal isOpen={isAiInfoModalOpen} onClose={() => setIsAiInfoModalOpen(false)} defaultTab="ai" />
    </header>
  )
}

