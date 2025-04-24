// File: /app/(app)/plan/edit/page.tsx
"use client" // Must be a client component

import PlanPageHandler from "@/components/plan-page-handler" // Assuming the new handler component path
import type { Metadata } from "next" // Keep for potential future use

// Note: generateMetadata won't work if this remains a client component.
/*
export const metadata: Metadata = {
  title: "Create New Plan - T-JSON",
  description: "Create a new training plan",
};
*/

export default function NewPlanEditPage() {
  // This page handles the '/plan/edit' route for creating NEW plans.
  // It renders the central handler, passing null for planId and indicating edit intent.
  return <PlanPageHandler planId={null} editIntent={true} />
}
