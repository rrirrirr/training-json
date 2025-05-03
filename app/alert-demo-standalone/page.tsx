"use client";

import React from "react";
import { AlertProvider } from "@/contexts/alert-context";
import { GlobalAlert } from "@/components/layout/GlobalAlert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Edit, Ban, X } from "lucide-react";

export default function AlertDemo() {
  const [alerts, setAlerts] = React.useState({
    message: null,
    severity: null,
    isVisible: false,
  });

  const showInfoAlert = () => {
    setAlerts({
      message: "This is an information message.",
      severity: "info",
      isVisible: true,
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      setAlerts(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const showWarningAlert = () => {
    setAlerts({
      message: "Warning! This action may have consequences.",
      severity: "warning",
      isVisible: true,
    });
  };

  const showErrorAlert = () => {
    setAlerts({
      message: "An error occurred while processing your request.",
      severity: "error",
      isVisible: true,
    });
  };

  const showEditModeAlert = () => {
    setAlerts({
      message: "You are in edit mode. Don't forget to save your changes!",
      severity: "edit",
      isVisible: true,
    });
  };

  const hideAlert = () => {
    setAlerts(prev => ({ ...prev, isVisible: false }));
  };

  // Custom Alert Component for the demo
  const DemoAlert = () => {
    const { message, severity, isVisible } = alerts;
    
    if (!isVisible) return null;
    
    // Determine Icon
    const getIcon = () => {
      switch (severity) {
        case 'warning': return <AlertTriangle className="h-5 w-5" />;
        case 'error': return <Ban className="h-5 w-5" />;
        case 'info': return <Info className="h-5 w-5" />;
        case 'edit': return <Edit className="h-5 w-5" />;
        default: return <Info className="h-5 w-5" />;
      }
    };
    
    // Determine styling
    const getClasses = () => {
      switch (severity) {
        case 'warning': return "bg-yellow-100 border-yellow-300 text-yellow-800";
        case 'error': return "bg-red-100 border-red-300 text-red-800";
        case 'info': return "bg-blue-100 border-blue-300 text-blue-800";
        case 'edit': return "bg-green-100 border-green-300 text-green-800";
        default: return "bg-gray-100 border-gray-300 text-gray-800";
      }
    };
    
    return (
      <div className="max-w-md z-50">
        <div className={`flex items-center gap-3 p-3 rounded-md border shadow-md ${getClasses()}`}>
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-grow text-sm">{message}</div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={hideAlert}
            className="h-6 w-6 flex-shrink-0 ml-auto"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Alert System Demo</h1>
      
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0">
          <DemoAlert />
        </div>
      </div>
      
      <div className="flex flex-col gap-4 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold">Alert Examples</h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Click the buttons below to test different types of alerts:
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={showInfoAlert} variant="outline">Show Info Alert</Button>
          <Button onClick={showWarningAlert} variant="outline">Show Warning Alert</Button>
          <Button onClick={showErrorAlert} variant="outline">Show Error Alert</Button>
          <Button onClick={showEditModeAlert} variant="outline">Show Edit Mode Alert</Button>
          <Button onClick={hideAlert} variant="outline">Hide Current Alert</Button>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <p className="text-sm text-gray-600">
          This simplified demo shows alert functionality implemented directly in the page. 
          The actual Global Alert system uses React Context for state management and can be used 
          anywhere in your application.
        </p>
      </div>
    </div>
  );
}
