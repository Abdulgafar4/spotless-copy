// components/dashboard/payments/error-state.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle>Error Loading Payments</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          There was a problem loading your payment information. Please try again later.
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
