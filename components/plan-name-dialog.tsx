"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PlanNameDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  initialName?: string
  title?: string
  description?: string
  saveButtonText?: string
}

export default function PlanNameDialog({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  title = "Name Your Training Plan",
  description = "Give your training plan a name that helps you identify it later.",
  saveButtonText = "Save",
}: PlanNameDialogProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Please enter a name for your training plan")
      return
    }

    // Clear error and submit
    setError(null)
    onSave(trimmedName)
    onClose()
  }

  const isDisabled = !name.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-dialog-sm dialog-content-base">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                placeholder="My Training Plan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(null)
                }}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter className="dialog-footer-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>{saveButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{saveButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
