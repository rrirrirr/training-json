import { Metadata } from "next"
import { PlansGrid } from "@/components/plans-grid"

export const metadata: Metadata = {
  title: "Training Plans - T-JSON",
  description: "Browse and manage your training plans",
}

export default function PlansPage() {
  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8">
      <h1 className="text-3xl mb-10 font-oswald font-light uppercase tracking-wide">
        Training Plans
      </h1>
      
      <PlansGrid />
    </div>
  )
}