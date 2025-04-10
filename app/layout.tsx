// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google" // Or your chosen font
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { TrainingPlanProvider } from "@/contexts/training-plan-context" // Your existing provider
import { SidebarProvider } from "@/components/ui/sidebar" // Your existing provider
import { LayoutClient } from "@/components/layout/layout-client" // Client component wrapper
import { Toaster } from "@/components/ui/toaster" // Shadcn Toaster
import { ModalProvider } from "@/components/modals/modal-provider" // Existing modal provider
import { UIProvider } from "@/contexts/ui-context" // UI context provider
import { DialogProvider } from "@/components/dialogs/dialog-provider" // Add this line

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "T-JSON",
  description: "JSON-based training plan visualization tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <TrainingPlanProvider>
              <SidebarProvider>
                <LayoutClient>
                  {children}
                  <ModalProvider /> {/* Existing modal provider */}
                  <DialogProvider /> {/* Add our new dialog provider */}
                </LayoutClient>
              </SidebarProvider>
            </TrainingPlanProvider>
          </UIProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}