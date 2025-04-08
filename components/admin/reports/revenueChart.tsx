"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { subDays, format } from "date-fns"

interface RevenueChartProps {
  dateRange: string
  branch: string
}

// Generate mock data based on date range
const generateMockData = (days: number) => {
  const today = new Date()
  const data = []

  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i)
    const revenue = 1000 + Math.random() * 4000
    const bookings = 5 + Math.floor(Math.random() * 20)
    
    data.push({
      date: format(date, "MMM d"),
      revenue: parseFloat(revenue.toFixed(2)),
      bookings
    })
  }

  return data
}

// Mock data for different date ranges
const mockData = {
  "today": generateMockData(0),
  "this-week": generateMockData(7),
  "last-week": generateMockData(14).slice(0, 7),
  "this-month": generateMockData(30),
  "last-month": generateMockData(60).slice(0, 30),
  "this-quarter": generateMockData(90),
  "this-year": generateMockData(365),
  "custom": generateMockData(30),
}

export function RevenueChart({ dateRange, branch }: RevenueChartProps) {
  // Select data based on date range
  const data = mockData[dateRange as keyof typeof mockData] || mockData["this-month"]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          tickMargin={10}
          tickFormatter={(value) => value}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          yAxisId="left"
          tickFormatter={(value) => `$${value}`}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === "revenue") return [`$${value}`, "Revenue"]
            return [value, "Bookings"]
          }}
          labelStyle={{ color: '#111', fontWeight: 'bold' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          activeDot={{ r: 8 }}
          name="Revenue"
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="bookings"
          stroke="#6366f1"
          name="Bookings"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}