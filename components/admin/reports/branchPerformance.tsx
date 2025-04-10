"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpRight, ArrowDownRight, Building } from "lucide-react"
import { ProgressBar } from "@/components/admin/reports/progressBar"

interface BranchPerformanceTableProps {
  data: {
    branch: string
    bookings: number
    revenue: number
    growth: number
    customers: number
    staff: number
    utilization: number
  }[]
}

export function BranchPerformanceTable({ data }: BranchPerformanceTableProps) {
  // Sort data by revenue (highest first)
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Branch</TableHead>
            <TableHead className="text-right">Bookings</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Growth</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Staff</TableHead>
            <TableHead>Utilization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((branch) => (
            <TableRow key={branch.branch}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  {branch.branch}
                </div>
              </TableCell>
              <TableCell className="text-right">{branch.bookings}</TableCell>
              <TableCell className="text-right font-medium">${branch.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">
                <span className="flex items-center justify-end">
                  {branch.growth > 0 ? (
                    <>
                      <span className="text-green-500">+{branch.growth}%</span>
                      <ArrowUpRight className="ml-1 h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-red-500">{branch.growth}%</span>
                      <ArrowDownRight className="ml-1 h-4 w-4 text-red-500" />
                    </>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-right">{branch.customers}</TableCell>
              <TableCell className="text-right">{branch.staff}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProgressBar value={branch.utilization} max={100} />
                  <span className="text-xs font-medium">{branch.utilization}%</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}