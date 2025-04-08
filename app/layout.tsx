// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google" // Or your chosen font
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { TrainingPlanProvider } from "@/contexts/training-plan-context" // Your existing provider
import { SidebarProvider } from "@/components/ui/sidebar" // Your existing provider
import { LayoutClient } from "@/components/layout/layout-client" // NEW: Client component wrapper
import { Toaster } from "@/components/ui/toaster" // Assuming you use Shadcn Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Training Plan Manager", // Adjust as needed
  description: "Manage your training plans", // Adjust as needed
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
          <TrainingPlanProvider>
            <SidebarProvider>
              <LayoutClient>{children}</LayoutClient>
            </SidebarProvider>
          </TrainingPlanProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
