"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/contexts/alert-context";

/**
 * Example component demonstrating how to use the Global Alert system
 */
export function AlertExample() {
  const { showAlert, hideAlert } = useAlert();

  const showInfoAlert = () => {
    showAlert("This is an information message.", "info", {
      autoCloseDelay: 5000, // Auto-close after 5 seconds
    });
  };

  const showWarningAlert = () => {
    showAlert("Warning! This action may have consequences.", "warning");
  };

  const showErrorAlert = () => {
    showAlert("An error occurred while processing your request.", "error");
  };

  const showEditModeAlert = () => {
    showAlert("You are in edit mode. Don't forget to save your changes!", "edit");
  };

  const hideCurrentAlert = () => {
    hideAlert();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-semibold">Global Alert Examples</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={showInfoAlert} variant="outline">Show Info Alert</Button>
        <Button onClick={showWarningAlert} variant="outline">Show Warning Alert</Button>
        <Button onClick={showErrorAlert} variant="outline">Show Error Alert</Button>
        <Button onClick={showEditModeAlert} variant="outline">Show Edit Mode Alert</Button>
        <Button onClick={hideCurrentAlert} variant="outline">Hide Current Alert</Button>
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-muted/50">
        <h3 className="text-lg font-medium mb-2">Usage Instructions</h3>
        <p className="text-sm mb-2">
          Import the <code className="bg-muted px-1 rounded">useAlert</code> hook from <code className="bg-muted px-1 rounded">@/contexts/alert-context</code> 
          to access the alert functionality.
        </p>
        <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
{`// 1. Import the hook
import { useAlert } from "@/contexts/alert-context";

// 2. Use the hook in your component
function YourComponent() {
  const { showAlert, hideAlert } = useAlert();
  
  // 3. Show alerts with different severity levels
  const handleSuccess = () => {
    showAlert("Operation successful!", "info", { 
      autoCloseDelay: 3000  // Optional: Auto-close after 3 seconds
    });
  };
  
  const handleWarning = () => {
    showAlert("Warning message here", "warning");
  };
  
  const handleError = () => {
    showAlert("Error message here", "error");
  };
  
  const enterEditMode = () => {
    showAlert("You are now in edit mode", "edit");
  };
  
  // 4. Hide alerts programmatically
  const handleDismiss = () => {
    hideAlert();
  };
  
  // ...
}`}
        </pre>
      </div>
    </div>
  );
}