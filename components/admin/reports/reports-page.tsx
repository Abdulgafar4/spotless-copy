"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { RevenueChart } from "@/components/admin/reports/revenueChart";
import { ServiceDistributionChart } from "@/components/admin/reports/serviceChart";
import { BranchPerformanceTable } from "@/components/admin/reports/branchPerformance";
import {
  branches,
  branchPerformanceData,
  dateRanges,
  metrics,
} from "../adminDummyData";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-month");
  const [selectedBranch, setSelectedBranch] = useState("all");

  const handleExportReport = () => {
    console.log("Exporting report...");
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range
                    .replace("-", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch Selector */}
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.value} value={branch.value}>
                  {branch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden md:flex">
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
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
                  ) : (
                    <>
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{metric.growth}%</span>
                    </>
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

      {/* Charts and Tables (you can place your components here) */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
            Revenue trends for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart dateRange={dateRange} branch={selectedBranch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Distribution</CardTitle>
          <CardDescription>Breakdown by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceDistributionChart branch={selectedBranch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
          <CardDescription>
            Overview of all branches and their key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BranchPerformanceTable data={branchPerformanceData} />
        </CardContent>
      </Card>
    </div>
  );
}
