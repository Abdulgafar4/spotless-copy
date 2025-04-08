"use client"

import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface ServiceDistributionChartProps {
  branch: string
}

// Mock data for service distribution
const mockData = [
  { name: "Move-Out Cleaning", value: 35 },
  { name: "Move-In Cleaning", value: 25 },
  { name: "Deep Cleaning", value: 15 },
  { name: "Appliance Cleaning", value: 10 },
  { name: "Carpet Cleaning", value: 8 },
  { name: "Window Cleaning", value: 5 },
  { name: "Other Services", value: 2 },
]

// Custom colors for the pie chart
const COLORS = ["#10b981", "#6366f1", "#f97316", "#8b5cf6", "#3b82f6", "#ec4899", "#a3a3a3"]

export function ServiceDistributionChart({ branch }: ServiceDistributionChartProps) {
  // In a real app, you would filter data based on the branch
  const data = mockData

  return (
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
  )
}