import type { Metadata } from "next"
import { fetchPlanById } from "@/lib/plans"
import PlanViewer from "@/components/plan-viewer"
import { PlanLoaderAndSaver } from "@/components/plan-loader-and-saver"

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const { id } = await params

    const planData = await fetchPlanById(id)

    if (!planData) {
      return {
        title: "Plan Not Found - T-JSON",
        description: "The requested training plan could not be found.",
      }
    }

    // Use the plan name in the metadata
    return {
      title: `${planData.metadata?.planName || "Training Plan"} - T-JSON`,
      description: `View and manage your ${planData.metadata?.planName || ""} training plan`,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Error - T-JSON",
      description: "There was an error loading the training plan",
    }
  }
}

// The page component
export default async function PlanPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    const { id } = await params
    const planData = await fetchPlanById(id)

    // Check if planData exists after fetching
    if (!planData) {
      return (
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center max-w-lg p-8 bg-muted/80 rounded-lg border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Plan Not Found</h2>
            <p className="text-foreground/80 mb-6">
              The training plan with the requested ID could not be found.
            </p>
          </div>
        </div>
      )
    }
    
    return (
      <>
        {/* Only need PlanLoaderAndSaver - it now handles view mode detection */}
        <PlanLoaderAndSaver planData={planData} planId={id} />

        {/* Plan viewer component */}
        <PlanViewer planId={id} />
      </>
    )
  } catch (error) {
    console.error("Error in plan page:", error)
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-foreground/80 mb-6">There was an error loading the training plan.</p>
        </div>
      </div>
    )
  }
}