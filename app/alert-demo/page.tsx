"use client";

import { AlertExample } from "@/examples/alert-usage-example";
import { AlertProvider } from "@/contexts/alert-context";
import { GlobalAlert } from "@/components/layout/GlobalAlert";

export default function AlertDemo() {
  return (
    <AlertProvider>
      <div className="p-8 relative">
        {/* Position the alert at the top of the page */}
        <div className="fixed top-4 right-4 z-40">
          <GlobalAlert />
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Alert System Demo</h1>
        <AlertExample />
      </div>
    </AlertProvider>
  );
}
