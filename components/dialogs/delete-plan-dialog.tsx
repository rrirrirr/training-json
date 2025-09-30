"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeletePlanDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  planName?: string
  title?: string
  description?: string
}

export function DeletePlanDialog({
  isOpen,
  onClose,
  onConfirm,
  planName,
  title = "Delete Plan",
  description,
}: DeletePlanDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const defaultDescription = `Are you sure you want to delete "${planName || "this plan"}"? This action cannot be undone.`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
