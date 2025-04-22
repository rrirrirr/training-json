import type { Metadata } from "next"

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Edit Training Plan - T-JSON",
  description: "Edit your training plan",
}

export default function PlanEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}