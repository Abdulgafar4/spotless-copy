// components/booking/price-breakdown.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calculator } from "lucide-react"
import { PriceBreakdownItem } from "./booking-types"

interface PriceBreakdownProps {
  priceBreakdown: PriceBreakdownItem[]
  totalPrice: number
  formatCurrency: (amount: number) => string
}

export function PriceBreakdown({ 
  priceBreakdown, 
  totalPrice, 
  formatCurrency 
}: PriceBreakdownProps) {
  return (
    <Card className="mt-8 bg-gray-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Calculator className="h-5 w-5 mr-2" />
          Cost Estimate
        </CardTitle>
        <CardDescription>
          <div className="flex items-center text-amber-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Prices are subject to change after admin reviews uploaded images.
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {priceBreakdown.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.item}</span>
              <span className={item.price < 0 ? "text-green-600 font-medium" : ""}>
                {formatCurrency(item.price)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-2 pt-2"></div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}