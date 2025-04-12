// components/dashboard/payments/loading-state.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[300px]" />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
        </CardContent>
      </Card>
    </div>
  );
}
