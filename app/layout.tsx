import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "JSON training plan visualizer",
  description: "Created by me",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
