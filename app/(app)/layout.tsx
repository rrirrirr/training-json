import type { Metadata } from "next"
import { LayoutClient } from "@/components/layout/layout-client"
import { ModalProvider } from "@/components/modals/modal-provider"
import { DialogProvider } from "@/components/dialogs/dialog-provider"
import { PlanEventHandler } from "@/components/plan-event-handler"
import { SidebarProvider } from "@/components/ui/sidebar"
import { PlanModeProvider } from "@/contexts/plan-mode-context"
import { UIProvider } from "@/contexts/ui-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PlanDebugBar } from "@/components/plan-debug-bar"
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
    <PlanModeProvider>
      <UIProvider>
        <TooltipProvider delayDuration={100}>
          <SidebarProvider>
            <PlanEventHandler>
              <LayoutClient>
                {children}
                <ModalProvider />
                <DialogProvider />
                <PlanDebugBar />
              </LayoutClient>
            </PlanEventHandler>
          </SidebarProvider>
        </TooltipProvider>
      </UIProvider>
    </PlanModeProvider>
  )
}