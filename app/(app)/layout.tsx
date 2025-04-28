import type { Metadata } from "next"
import { cookies } from "next/headers" // Import cookies function
import { LayoutClient } from "@/components/layout/layout-client" // Your existing client layout
import { ModalProvider } from "@/components/modals/modal-provider"
import { DialogProvider } from "@/components/dialogs/dialog-provider"
import { UIProvider } from "@/contexts/ui-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PlanDebugBar } from "@/components/plan-debug-bar"
import { AppLoadedMarker } from "@/components/app-loaded-marker"

export const metadata: Metadata = {
  title: "T-JSON",
  description: "JSON-based training plan visualization tool",
}

// Define the cookie name (must match the one used on the client)
const LAYOUT_COOKIE_NAME = "app-sidebar-layout" // Use your autoSaveId or a new name

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const layoutCookie = cookieStore.get(LAYOUT_COOKIE_NAME)

  let defaultLayout: number[] | undefined = undefined

  if (layoutCookie?.value) {
    try {
      const parsedLayout = JSON.parse(layoutCookie.value)
      // Basic validation
      if (
        Array.isArray(parsedLayout) &&
        parsedLayout.length === 2 && // Ensure it has two values (sidebar, main)
        typeof parsedLayout[0] === "number" &&
        typeof parsedLayout[1] === "number"
      ) {
        defaultLayout = parsedLayout
        console.log(`[AppLayout Server] Read layout from cookie: [${defaultLayout.join(", ")}]`)
      } else {
        console.warn("[AppLayout Server] Invalid layout format in cookie:", layoutCookie.value)
      }
    } catch (e) {
      console.error("[AppLayout Server] Failed to parse layout cookie:", e)
      // Optional: Clear the invalid cookie?
    }
  } else {
    console.log("[AppLayout Server] No layout cookie found.")
  }

  return (
    // UIProvider might still be needed for dialogs
    <UIProvider>
      <TooltipProvider delayDuration={100}>
        {/* Pass defaultLayout to LayoutClient */}
        {/* Note: SidebarProvider is now inside LayoutClient */}
        <LayoutClient defaultLayout={defaultLayout}>
          {children}
          <ModalProvider />
          <DialogProvider />
          {/*          <PlanDebugBar /> */}
          <AppLoadedMarker />
        </LayoutClient>
      </TooltipProvider>
    </UIProvider>
  )
}
