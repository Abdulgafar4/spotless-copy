"use client";

import React from "react";
import { Home, Bath, Tv, Car } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { InputWithNumber } from "./InputWithNumber";

interface PropertyDetailsSimpleProps {
  bookingData: any;
  handleInputChange: (field: string, value: any) => void;
  errors: any;
}

export function PropertyDetailsSimple({ 
  bookingData, 
  handleInputChange, 
  errors 
}: PropertyDetailsSimpleProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        <InputWithNumber
          icon={<Home className="h-4 w-4" />}
          label="Bedrooms"
          value={bookingData.bedrooms}
          onChange={(value) => handleInputChange("bedrooms", value)}
          error={errors.bedrooms}
        />
        
        <InputWithNumber
          icon={<Bath className="h-4 w-4" />}
          label="Bathrooms"
          value={bookingData.bathrooms}
          onChange={(value) => handleInputChange("bathrooms", value)}
          error={errors.bathrooms}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <InputWithNumber
          icon={<Tv className="h-4 w-4" />}
          label="Living Rooms"
          value={bookingData.livingRooms}
          onChange={(value) => handleInputChange("livingRooms", value)}
        />
        
        <InputWithNumber
          icon={<Car className="h-4 w-4" />}
          label="Garages"
          value={bookingData.garages}
          onChange={(value) => handleInputChange("garages", value)}
        />
      </div>
      
      <div className="flex items-center space-x-2 pl-1">
        <Checkbox
          id="den"
          checked={bookingData.den}
          onCheckedChange={(checked) => 
            handleInputChange("den", checked === true)
          }
        />
        <label
          htmlFor="den"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Den/Office Space
        </label>
      </div>
    </div>
  );
}