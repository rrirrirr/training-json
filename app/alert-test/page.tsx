"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertProvider } from "@/contexts/alert-context";
import { GlobalAlert } from "@/components/layout/GlobalAlert";
import { useAlert } from "@/contexts/alert-context";

function AlertButtons() {
  const { showAlert, hideAlert } = useAlert();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Alert System Testing</h2>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-md">
          <h3 className="text-base font-medium mb-3">Regular Alerts</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => showAlert("This is an information message", "info", { autoCloseDelay: 5000 })}
              variant="outline"
              size="sm"
            >
              Info (Auto-close)
            </Button>
            
            <Button 
              onClick={() => showAlert("Warning! This is important", "warning")}
              variant="outline"
              size="sm"
            >
              Warning
            </Button>
            
            <Button 
              onClick={() => showAlert("Error occurred", "error")}
              variant="outline"
              size="sm"
            >
              Error
            </Button>
            
            <Button 
              onClick={() => showAlert("You're in edit mode", "edit")}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="p-4 border rounded-md bg-slate-50">
          <h3 className="text-base font-medium mb-2">Collapsible Alerts</h3>
          <p className="text-xs text-gray-600 mb-3">
            These collapse to show just the icon after a delay:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => showAlert(
                "The icon stays in place while the alert expands/collapses", 
                "info", 
                { collapsible: true, collapseDelay: 3000 }
              )}
              variant="outline"
              size="sm"
            >
              Info (3s)
            </Button>
            
            <Button 
              onClick={() => showAlert(
                "Edit mode active - hover over icon to expand", 
                "edit", 
                { collapsible: true, collapseDelay: 5000 }
              )}
              variant="outline"
              size="sm"
            >
              Edit (5s)
            </Button>
            
            <Button 
              onClick={() => showAlert(
                "This warning will collapse after 3 seconds", 
                "warning", 
                { collapsible: true, collapseDelay: 3000 }
              )}
              variant="outline"
              size="sm"
            >
              Warning (3s)
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-2">
        <Button 
          onClick={() => hideAlert()}
          variant="outline"
        >
          Dismiss Current Alert
        </Button>
      </div>
    </div>
  );
}

export default function SimpleAlertDemo() {
  return (
    <AlertProvider>
      <div className="p-8 relative max-w-4xl mx-auto">
        <div className="fixed top-4 right-4 z-40">
          <GlobalAlert />
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Global Alert System Demo</h1>
        <p className="mb-6">
          This demo showcases the global alert system with both regular and collapsible alerts.
          The collapsible alerts feature a stable icon that remains in place during transitions.
        </p>
        
        <AlertButtons />
        
        <div className="mt-8 p-4 border rounded bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Alert System Features</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-base font-medium mb-2">Basic Features</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Multiple severity levels (info, warning, error, edit)</li>
                <li>Automatic closing with configurable delay</li>
                <li>Manual dismissal via close button</li>
                <li>Consistent styling based on severity</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-2">Collapsible Features</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Stable icon position during transitions</li>
                <li>Horizontal expansion to preserve icon placement</li>
                <li>Configurable collapse delay</li>
                <li>Expand on hover for easy access</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-5 p-3 border border-blue-100 rounded bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> For a more detailed demonstration of the collapsible feature 
              with the stable icon animation, visit the <a href="/alert-test-collapsible" className="underline">
              dedicated collapsible demo page</a>.
            </p>
          </div>
        </div>
      </div>
    </AlertProvider>
  );
}