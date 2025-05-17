"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MapPinned, Info, Building } from "lucide-react"
import { Control } from "react-hook-form"
import { BookingFormValues, Branch, Service } from "./booking-types"

interface ServiceInfoFormProps {
  control: Control<BookingFormValues>
  branches: Branch[]
  services: Service[]
  servicesLoading: boolean
  formatCurrency: (amount: number) => string
}

export function ServiceInfoForm({
  control,
  branches,
  services,
  servicesLoading,
  formatCurrency
}: ServiceInfoFormProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 mt-8">Service Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Service Type
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesLoading ? (
                        <SelectItem value="loading" disabled>Loading services...</SelectItem>
                      ) : services.filter(service => service.status === "active").map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(parseFloat(String(service.price)))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Street Address
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPinned className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input {...field} placeholder="Street Address" className="pl-10 h-12" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Postal Code                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input {...field} placeholder="Postal Code" className="pl-10 h-12" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Nearest Branch
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}