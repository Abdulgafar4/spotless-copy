// components/admin/reports/branch-performance-container.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BranchPerformanceTable } from "./branchPerformance";

interface BranchPerformance {
  branch: string;
  bookings: number;
  revenue: number;
  growth: number;
  customers: number;
  staff: number;
  utilization: number;
}

interface BranchPerformanceContainerProps {
  data: BranchPerformance[];
  isLoading: boolean;
}

export function BranchPerformanceContainer({ 
  data, 
  isLoading 
}: BranchPerformanceContainerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>Loading branch data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Performance</CardTitle>
        <CardDescription>
          Overview of all branches and their key metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BranchPerformanceTable data={data} />
      </CardContent>
    </Card>
  );
}

