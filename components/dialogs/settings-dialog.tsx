"use client"

import { useUIState } from "@/contexts/ui-context"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SettingsDialog() {
  const { isSettingsDialogOpen, closeSettingsDialog } = useUIState()
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={isSettingsDialogOpen} onOpenChange={(open) => !open && closeSettingsDialog()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your application settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center grid-cols-4 gap-4">
            <Label htmlFor="theme" className="text-right col-span-1">
              Theme
            </Label>
            <div className="flex gap-2 col-span-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={closeSettingsDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}