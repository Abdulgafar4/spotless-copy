"use client";

import { useState, useEffect } from "react";
import { useReports } from "@/hooks/use-reports";
import { ReportLoadingState } from "./report-loading-state";
import { ReportErrorState } from "./report-error-state";
import { ReportFilters } from "./report-filter";
import { MetricsCards } from "./metrics-cards";
import { RevenueChartContainer } from "./revenue-chart-container";
import { ServiceDistributionContainer } from "./service-distribution-container";
import { BranchPerformanceContainer } from "./branch-performance-container";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("this-month");
  const [selectedBranch, setSelectedBranch] = useState("all");
  
  const {
    revenueData,
    branchPerformance,
    serviceDistribution,
    metrics,
    loading,
    error,
    getRevenueData,
    getBranchPerformance,
    getServiceDistribution,
    getMetricSummary
  } = useReports();

  useEffect(() => {
    // When date range changes, update revenue and metrics
    const updateDateBasedData = async () => {
      await getRevenueData(dateRange, selectedBranch);
      await getMetricSummary(dateRange);
    };
    
    updateDateBasedData();
  }, [dateRange, getRevenueData, getMetricSummary]);

  useEffect(() => {
    // When branch changes, update revenue and service distribution
    const updateBranchBasedData = async () => {
      await getRevenueData(dateRange, selectedBranch);
      await getServiceDistribution(selectedBranch);
    };
    
    updateBranchBasedData();
  }, [selectedBranch, getRevenueData, getServiceDistribution]);

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
  };

  const handleBranchChange = (newBranch: string) => {
    setSelectedBranch(newBranch);
  };

  const handleExportReport = () => {
    // In a real implementation, this would generate and download a report
    console.log("Exporting report...");
    alert("Report export feature coming soon!");
  };

  if (loading && (!revenueData.length || !branchPerformance.length)) {
    return <ReportLoadingState />;
  }

  if (error) {
    return <ReportErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Filters */}
      <ReportFilters
        dateRange={dateRange}
        selectedBranch={selectedBranch}
        onDateRangeChange={handleDateRangeChange}
        onBranchChange={handleBranchChange}
        onExport={handleExportReport}
      />

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Charts and Tables */}
      <RevenueChartContainer
        data={revenueData} 
        dateRange={dateRange} 
        branch={selectedBranch} 
        isLoading={loading} 
      />

      <ServiceDistributionContainer
        data={serviceDistribution} 
        branch={selectedBranch} 
        isLoading={loading} 
      />

      <BranchPerformanceContainer
        data={branchPerformance} 
        isLoading={loading} 
      />
    </div>
  );
}