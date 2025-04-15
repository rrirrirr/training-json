"use client"

import { useUIState } from "@/contexts/ui-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export function InfoDialog() {
  const { isInfoDialogOpen, closeInfoDialog } = useUIState()

  return (
    <Dialog open={isInfoDialogOpen} onOpenChange={(open) => !open && closeInfoDialog()}>
      <DialogContent className="max-w-dialog-lg dialog-content-base">
        <DialogHeader>
          <DialogTitle>About T-JSON</DialogTitle>
          <DialogDescription>
            A JSON-based training plan visualization tool
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
            <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
            <TabsTrigger value="json" className="flex-1">JSON Format</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="about" className="p-1">
              <div className="prose prose-sm dark:prose-invert">
                <p>
                  T-JSON is a web application for visualizing and managing training plans stored in a 
                  standardized JSON format. It allows coaches and athletes to create, edit, and track 
                  personalized workout plans.
                </p>
                <p>
                  This tool was designed to allow maximum flexibility while maintaining a consistent 
                  data structure. Each training plan follows a normalized JSON schema that separates 
                  exercise definitions from their usage instances, making plans more maintainable.
                </p>
                <p>
                  Built with Next.js, React, TypeScript, and Tailwind CSS.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="p-1">
              <div className="prose prose-sm dark:prose-invert">
                <ul>
                  <li>Monthly & Weekly Views - Switch between block overviews and detailed weekly schedules</li>
                  <li>Multiple Training Plans - Create, edit, and manage multiple plans</li>
                  <li>Detailed Exercise Tracking - View complete details for exercises including sets, reps, load</li>
                  <li>Session Management - Group exercises into logical training sessions</li>
                  <li>Theme-Aware Styling - Colors adapt automatically to light and dark themes</li>
                  <li>Data Import/Export - Import and export training plans as JSON</li>
                  <li>Mobile Responsive - Fully responsive design that works on all devices</li>
                  <li>Local Storage - Plans are saved in browser's local storage</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="json" className="p-1">
              <div className="prose prose-sm dark:prose-invert">
                <p>
                  T-JSON uses a normalized JSON structure with three main sections:
                </p>
                <ul>
                  <li><strong>exerciseDefinitions</strong> - Definitions of all exercises</li>
                  <li><strong>weeks</strong> - An array of all training weeks</li>
                  <li><strong>monthBlocks</strong> - Information about how weeks are grouped</li>
                </ul>
                <p>
                  For complete documentation on the JSON format, visit the documentation page.
                </p>
                <pre className="text-xs bg-muted p-2 rounded-md">
{`{
  "metadata": {
    "planName": "My 5x5 Program"
  },
  "exerciseDefinitions": [...],
  "weeks": [...],
  "monthBlocks": [...]
}`}
                </pre>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="dialog-footer-between">
          <Link href="/documentation" passHref>
            <Button variant="outline" className="dialog-button-icon">
              Documentation <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
          <Button onClick={closeInfoDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}