import type { Metadata } from "next"
import { Inter, Archivo_Black, Oswald } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { TrainingPlanProvider } from "@/contexts/training-plan-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LayoutClient } from "@/components/layout/layout-client"
import { Toaster } from "@/components/ui/toaster"
import { ModalProvider } from "@/components/modals/modal-provider"
import { UIProvider } from "@/contexts/ui-context"
import { DialogProvider } from "@/components/dialogs/dialog-provider"
import { cn } from "@/lib/utils" // Import cn utility
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontArchivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
})

const fontOswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-oswald",
  display: "swap",
})

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
      <head />
      {/* --- CORRECTED BODY TAG --- */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontArchivoBlack.variable,
          fontOswald.variable
        )}
      >
        {/* --- END OF CORRECTIONS --- */}
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
                  <ModalProvider />
                  <DialogProvider />
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
