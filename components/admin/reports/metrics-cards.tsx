// components/admin/reports/metrics-cards.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Users,
  Star,
} from "lucide-react";

interface MetricSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  avgRating: number;
}

export function MetricsCards({ metrics }: { metrics: MetricSummary }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      growth: metrics.revenueGrowth,
      subtitle: "from previous period",
    },
    {
      title: "Total Bookings",
      value: metrics.totalBookings.toString(),
      icon: Calendar,
      growth: metrics.bookingsGrowth,
      subtitle: "from previous period",
    },
    {
      title: "Active Customers",
      value: metrics.totalCustomers.toString(),
      icon: Users,
      growth: metrics.customerGrowth,
      subtitle: "from previous period",
    },
    {
      title: "Average Rating",
      value: metrics.avgRating.toFixed(1),
      icon: Star,
      subtitle: "from customer reviews",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metricCards.map((metric, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.growth !== undefined ? (
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.growth > 0 ? (
                  <>
                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500">+{metric.growth}%</span>
                  </>
                ) : metric.growth < 0 ? (
                  <>
                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                    <span className="text-red-500">{metric.growth}%</span>
                  </>
                ) : (
                  <span>0% change</span>
                )}
                <span className="ml-1">{metric.subtitle}</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {metric.subtitle}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

