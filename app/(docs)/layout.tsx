import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "T-JSON Documentation",
  description: "Documentation for the T-JSON training plan visualization tool",
}

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}