import { Edit2, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export default function StudentNotesPage() {
  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4 bg-secondary/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Edit2 className="h-5 w-5 text-muted-foreground" />
          My Notes
        </CardTitle>
        <CardDescription>Your private study workspace for digital notes.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert variant="info" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            This feature is currently in development. You will soon be able to take, save, and export notes directly here.
          </AlertDescription>
        </Alert>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Edit2 className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>No Notes Available</EmptyTitle>
            <EmptyDescription>The notes workspace is being prepared for you.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
