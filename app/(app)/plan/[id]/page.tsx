"use client"

import React from "react"
import PlanPageHandler from "@/components/plan-page-handler"
import type { Metadata } from "next"

interface PlanPageParams {
  id: string
}

export default function PlanPage({ params }: { params: Promise<PlanPageParams> }) {
  const resolvedParams = React.use(params)

  return <PlanPageHandler planId={resolvedParams.id} editIntent={false} />
}
