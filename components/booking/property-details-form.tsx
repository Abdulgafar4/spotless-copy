"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { BedDouble, Bath, Sofa, CarFront, AlertCircle } from "lucide-react"
import { Control } from "react-hook-form"
import { BookingFormValues } from "./booking-types"

interface PropertyDetailsFormProps {
  control: Control<BookingFormValues>
}

export function PropertyDetailsForm({ control }: PropertyDetailsFormProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 mt-8">Property Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Number of Bedrooms
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="number" 
                    min={0} 
                    max={10} 
                    {...field} 
                    placeholder="0" 
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
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Number of Bathrooms
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Bath className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="number" 
                    min={0} 
                    max={10} 
                    {...field} 
                    placeholder="0" 
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
          name="livingRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Number of Living Rooms
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Sofa className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="number" 
                    min={0} 
                    max={5} 
                    {...field} 
                    placeholder="0" 
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
          name="garages"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Number of Garages
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <CarFront className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="number" 
                    min={0} 
                    max={3} 
                    {...field} 
                    placeholder="0" 
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

      <FormField
        control={control}
        name="den"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Includes Den
              </FormLabel>
              <FormDescription>
                Check this if your property has a den or office space
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  )
}