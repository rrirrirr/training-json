// File: /app/(app)/layout.tsx

import type { Metadata } from "next"
import { LayoutClient } from "@/components/layout/layout-client"
import { ModalProvider } from "@/components/modals/modal-provider"
import { DialogProvider } from "@/components/dialogs/dialog-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { UIProvider } from "@/contexts/ui-context" // Keep UIProvider
import { TooltipProvider } from "@/components/ui/tooltip"
import { PlanDebugBar } from "@/components/plan-debug-bar" // Using Zustand store
import { AppLoadedMarker } from "@/components/app-loaded-marker"

export const metadata: Metadata = {
  title: "T-JSON",
  description: "JSON-based training plan visualization tool",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // REMOVE PlanModeProvider wrapper
    // <PlanModeProvider>
    <UIProvider>
      {/* Keep UIProvider for dialogs */}
      <TooltipProvider delayDuration={100}>
        <SidebarProvider>
          <LayoutClient>
            {children}
            <ModalProvider />
            <DialogProvider />
            {/* PlanDebugBar now reads from usePlanStore */}
            <PlanDebugBar />
            <AppLoadedMarker />
          </LayoutClient>
          {/* Optional: PlanEventHandler can be added here if needed */}
        </SidebarProvider>
      </TooltipProvider>
    </UIProvider>
  )
}
