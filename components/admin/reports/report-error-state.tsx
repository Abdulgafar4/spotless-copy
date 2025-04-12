

// components/admin/reports/report-error-state.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ReportErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function ReportErrorState({ error, onRetry }: ReportErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle>Error Loading Reports</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          There was a problem loading the report data. Please try again later.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error.message}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onRetry}>
          Retry
        </Button>
      </CardFooter>
    </Card>
  );
}