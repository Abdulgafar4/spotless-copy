"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { User, Mail, Phone, AlertCircle } from "lucide-react"
import { Control } from "react-hook-form"
import { BookingFormValues } from "./booking-types"

interface PersonalInfoFormProps {
  control: Control<BookingFormValues>
}

export function PersonalInfoForm({ control }: PersonalInfoFormProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                First Name
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    {...field} 
                    placeholder="First Name" 
                    className="pl-10 h-12" 
                    required
                    aria-required="true"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Last Name
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    {...field} 
                    placeholder="Last Name" 
                    className="pl-10 h-12" 
                    required
                    aria-required="true"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Email
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    {...field} 
                    placeholder="E-Mail" 
                    type="email" 
                    className="pl-10 h-12" 
                    required
                    aria-required="true"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Phone Number
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    {...field} 
                    placeholder="Phone Number" 
                    className="pl-10 h-12" 
                    required
                    aria-required="true"
                  />
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