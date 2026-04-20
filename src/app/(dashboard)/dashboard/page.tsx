import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Journals</h1>
          <p className="text-muted-foreground">Write your thoughts and let AI understand you.</p>
        </div>
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          New Entry
        </Button>
      </div>

      <div className="border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No entries yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Get started by writing your first journal entry. Over time, Debo will build an intelligent context window around you.
        </p>
      </div>
    </div>
  );
}
