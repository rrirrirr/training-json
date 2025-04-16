"use client"

import { Button } from "@/components/ui/button"
import { useUploadModal } from "@/components/modals/upload-modal"

export default function TestPage() {
  const uploadModal = useUploadModal()
  
  const handleOpenUploadModal = () => {
    // Open upload modal without a callback to test edit mode
    console.log("[TestPage] Opening upload modal without callback");
    uploadModal.open();
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Edit Mode</h1>
      <p className="mb-4">
        This page is for testing the edit mode flow. Click the button below to open the 
        upload modal without a callback, which should trigger the edit mode path.
      </p>
      <Button onClick={handleOpenUploadModal} className="mt-4">
        Open Upload Modal (Edit Mode)
      </Button>
    </div>
  )
}