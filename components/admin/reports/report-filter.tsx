// components/admin/reports/report-filters.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Branch {
  id: string;
  name: string;
  value: string;
}

interface ReportFiltersProps {
  dateRange: string;
  selectedBranch: string;
  onDateRangeChange: (range: string) => void;
  onBranchChange: (branch: string) => void;
  onExport: () => void;
}

export function ReportFilters({
  dateRange,
  selectedBranch,
  onDateRangeChange,
  onBranchChange,
  onExport
}: ReportFiltersProps) {
  const [branches, setBranches] = useState<Branch[]>([
    { id: "all", name: "All Branches", value: "all" },
  ]);

  useEffect(() => {
    // Fetch real branches from the database
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("id, name")
          .order("name");

        if (error) {
          throw error;
        }

        if (data) {
          const formattedBranches = data.map((branch) => ({
            id: branch.id,
            name: branch.name,
            value: branch.id,
          }));
          
          // Combine with the "All Branches" option
          setBranches([
            { id: "all", name: "All Branches", value: "all" },
            ...formattedBranches,
          ]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const dateRanges = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this-week" },
    { label: "Last Week", value: "last-week" },
    { label: "This Month", value: "this-month" },
    { label: "Last Month", value: "last-month" },
    { label: "This Quarter", value: "this-quarter" },
    { label: "This Year", value: "this-year" },
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="flex gap-2">
        {/* Date Range Selector */}
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Selector */}
        <Select value={selectedBranch} onValueChange={onBranchChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.value}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:flex">
        <Button onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  );
}

