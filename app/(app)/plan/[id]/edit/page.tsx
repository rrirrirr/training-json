"use client"

import React from "react"
import PlanPageHandler from "@/components/plan-page-handler"
import type { Metadata } from "next"

interface PlanEditPageParams {
  id: string
}

export default function PlanEditPage({ params }: { params: Promise<PlanEditPageParams> }) {
  const resolvedParams = React.use(params)

  return <PlanPageHandler planId={resolvedParams.id} editIntent={true} />
}
