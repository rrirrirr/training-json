"use client"
import { useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store" // Ensure correct path

type PlanLoaderAndSaverProps = {
  planData: TrainingPlanData | null
  planId: string
}

export function PlanLoaderAndSaver({ planData, planId }: PlanLoaderAndSaverProps) {
  const setActivePlan = usePlanStore((state) => state.setActivePlan)
  const clearActivePlan = usePlanStore((state) => state.clearActivePlan)
  const currentStoreActiveId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata) // Needed if we fetch

  useEffect(() => {
    const effectTimestamp = Date.now() // For debugging timing
    console.log(
      `[${effectTimestamp}] [PlanLoaderAndSaver] Effect - Page ID: ${planId}, Store Active ID: ${currentStoreActiveId}, List Size: ${planMetadataList.length}`
    )
    console.log(
      `[${effectTimestamp}] [PlanLoaderAndSaver] Effect - Received planData: ${planData ? "Yes" : "No"}`
    )

    if (planData) {
      const planExistsInStoreList = planMetadataList.some((meta) => meta.id === planId)

      if (
        currentStoreActiveId !== planId &&
        (planMetadataList.length === 0 || planExistsInStoreList)
      ) {
        console.log(
          `[${effectTimestamp}] [PlanLoaderAndSaver] Condition met to set active plan (${planId}). List empty: ${planMetadataList.length === 0}, Exists in list: ${planExistsInStoreList}`
        )
        setActivePlan(planData, planId)
      } else if (
        currentStoreActiveId !== planId &&
        planMetadataList.length > 0 &&
        !planExistsInStoreList
      ) {
        // Case: Not active, list HAS loaded, but this plan is NOT in it. Likely deleted.
        console.warn(
          `[${effectTimestamp}] [PlanLoaderAndSaver] Plan ${planId} not active and not found in loaded list (${planMetadataList.length} items). Likely deleted. Aborting setActivePlan.`
        )
      } else if (currentStoreActiveId === planId) {
        // Case: Already active. Log for info.
        console.log(
          `[${effectTimestamp}] [PlanLoaderAndSaver] Plan ${planId} is already active in store. No action needed.`
        )
        // Optional: Add the check here too, to clear if active but missing from list
        if (!planExistsInStoreList && planMetadataList.length > 0) {
          console.warn(
            `[${effectTimestamp}] [PlanLoaderAndSaver] Active plan ${planId} is missing from loaded list (${planMetadataList.length} items). Clearing active plan.`
          )
          clearActivePlan()
        }
      } else {
        // Should not be reachable if logic is sound
        console.error(
          `[${effectTimestamp}] [PlanLoaderAndSaver] Unhandled state in planData block.`
        )
      }
    } else {
      // No planData received for this page ID.
      console.warn(
        `[${effectTimestamp}] [PlanLoaderAndSaver] No planData received for page ID: ${planId}.`
      )
      if (currentStoreActiveId === planId) {
        // If the store thinks this (non-existent) plan is active, clear it.
        console.warn(
          `[${effectTimestamp}] [PlanLoaderAndSaver] Store active ID matches failed page ID (${planId}). Clearing active plan.`
        )
        clearActivePlan()
      }
    }
    // Keep planMetadataList dependency
  }, [planData, planId, setActivePlan, clearActivePlan, currentStoreActiveId, planMetadataList])

  return null
}
