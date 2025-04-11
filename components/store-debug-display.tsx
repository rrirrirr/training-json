// File: components/ZustandDebugDisplay.tsx
"use client" // Mark as a Client Component

import React from "react"
import { usePlanStore } from "@/store/plan-store" // Import your Zustand store

export function ZustandDebugDisplay() {
  // Subscribe to the activePlan state and get the setter function
  const activePlan = usePlanStore((state) => state.activePlan)
  const setActivePlan = usePlanStore((state) => state.setActivePlan)

  const handleClearStore = () => {
    console.log("Debug: Clearing activePlan in Zustand store.")
    setActivePlan(null)
    // Optionally, clear local storage as well if you want the debug button to do both
    try {
      localStorage.removeItem("activeTrainingPlan") // Use the same key as PlanLoaderAndSaver
      console.log("Debug: Removed activeTrainingPlan from local storage.")
    } catch (error) {
      console.error("Debug: Error removing from local storage:", error)
    }
  }

  return (
    <div
      style={{
        border: "2px dashed red",
        padding: "10px",
        marginTop: "20px",
        backgroundColor: "#f0f0f0",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Zustand Store Debugger</h3>
      <button onClick={handleClearStore} style={{ marginBottom: "10px" }}>
        Clear Active Plan (Zustand & LocalStorage)
      </button>
      <h4>Current `activePlan` in Store:</h4>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          maxHeight: "400px",
          overflowY: "auto",
          background: "#fff",
          padding: "5px",
        }}
      >
        {activePlan ? JSON.stringify(activePlan, null, 2) : "null"}
      </pre>
    </div>
  )
}
