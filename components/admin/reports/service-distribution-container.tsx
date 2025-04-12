// components/admin/reports/service-distribution-container.tsx
"use client";

import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceDistribution {
  name: string;
  value: number;
}

interface ServiceDistributionContainerProps {
  data: ServiceDistribution[];
  branch: string;
  isLoading: boolean;
}

export function ServiceDistributionContainer({ 
  data, 
  branch, 
  isLoading 
}: ServiceDistributionContainerProps) {
  // Custom colors for the pie chart
  const COLORS = ["#10b981", "#6366f1", "#f97316", "#8b5cf6", "#3b82f6", "#ec4899", "#a3a3a3"];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Distribution</CardTitle>
          <CardDescription>Loading service data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Distribution</CardTitle>
        <CardDescription>Breakdown by service type</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconSize={10}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
