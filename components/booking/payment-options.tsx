"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Percent, Receipt } from "lucide-react"
import { Control } from "react-hook-form"
import { BookingFormValues } from "./booking-types"

interface PaymentOptionsProps {
  control: Control<BookingFormValues>
  totalPrice: number
  finalPaymentAmount: number
  formatCurrency: (amount: number) => string
}

export function PaymentOptions({ 
  control, 
  totalPrice, 
  finalPaymentAmount, 
  formatCurrency 
}: PaymentOptionsProps) {
  // Calculate 70% of total for deposit option
  const depositAmount = totalPrice * 0.7
  
  return (
    <FormField
      control={control}
      name="paymentOption"
      render={({ field }) => (
        <FormItem className="mt-8">
          <FormLabel>Payment Option</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className={`flex flex-col border rounded-lg p-4 ${field.value === "full" ? "bg-green-50 border-green-200" : ""}`}>
                <RadioGroupItem value="full" id="option-full" className="sr-only" />
                <Label
                  htmlFor="option-full"
                  className="flex cursor-pointer flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Pay in Full (5% Discount)</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Pay the entire amount now and receive a 5% discount.
                  </div>
                  <div className="font-medium text-green-600 mt-2">
                    You pay: {formatCurrency(field.value === "full" ? finalPaymentAmount : totalPrice * 0.95)}
                  </div>
                </Label>
              </div>

              <div className={`flex flex-col border rounded-lg p-4 ${field.value === "deposit" ? "bg-blue-50 border-blue-200" : ""}`}>
                <RadioGroupItem value="deposit" id="option-deposit" className="sr-only" />
                <Label
                  htmlFor="option-deposit"
                  className="flex cursor-pointer flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Pay 70% Deposit</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Pay 70% of the total now, and the remaining balance after service.
                  </div>
                  <div className="font-medium text-blue-600 mt-2">
                    You pay now: {formatCurrency(depositAmount)}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}