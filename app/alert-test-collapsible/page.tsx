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
          <h3 className="text-base font-medium mb-2">Stable Icon Collapsible Alerts</h3>
          <p className="text-xs text-gray-600 mb-3">
            These collapse to a circle with the icon staying in place:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => showAlert(
                "This alert collapses with a stable icon position for smooth animation", 
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
                "Edit mode active - hover over the icon to expand this alert", 
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
                "The icon stays in place while the alert expands to the right", 
                "warning", 
                { collapsible: true, collapseDelay: 3000 }
              )}
              variant="outline"
              size="sm"
            >
              Warning (3s)
            </Button>
            
            <Button 
              onClick={() => showAlert(
                "Notice how the icon never moves during the animation", 
                "error", 
                { collapsible: true, collapseDelay: 4000 }
              )}
              variant="outline"
              size="sm"
            >
              Error (4s)
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

export default function CollapsibleAlertDemo() {
  return (
    <AlertProvider>
      <div className="p-8 relative max-w-4xl mx-auto">
        <div className="fixed top-4 right-4 z-40">
          <GlobalAlert />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Stable-Icon Collapsible Alerts</h1>
        <p className="mb-6 text-gray-600">
          This demo showcases the improved collapsible alerts with a stable icon position. The icon
          stays fixed in place while the alert expands and collapses, creating a much smoother animation.
        </p>
        
        <AlertButtons />
        
        <div className="mt-8 p-5 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Stable Icon Animation</h2>
          <p className="text-sm mb-3">
            The improved alert system now features a smoother animation with a stable icon position:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <h3 className="text-base font-medium mb-2">Key Improvements</h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>
                  <strong>Stable Icon:</strong> Icon stays fixed in position during transitions
                </li>
                <li>
                  <strong>Expand from Left:</strong> Alert expands and collapses horizontally from left to right
                </li>
                <li>
                  <strong>Smoother Animation:</strong> No more jarring movement during transitions
                </li>
                <li>
                  <strong>Better Experience:</strong> More professional and refined user experience
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-2">Technical Details</h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Uses absolute positioning for the icon to maintain its position</li>
                <li>Sets a fixed left padding to accommodate the icon space</li>
                <li>Disables transitions on the icon element itself</li>
                <li>Uses origin-left to ensure consistent expansion/collapse direction</li>
                <li>Properly manages content visibility during transitions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-5 p-3 border border-blue-100 rounded bg-blue-50">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> The stable icon makes the collapsible alerts much more visually appealing
              and provides a more intuitive experience for users. The icon serves as a consistent anchor point
              that users can easily target with their cursor.
            </p>
          </div>
        </div>
      </div>
    </AlertProvider>
  );
}