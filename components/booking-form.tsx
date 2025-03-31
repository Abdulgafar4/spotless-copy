"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Upload, User, Mail, Phone, MapPin, Building, MapPinned, Info, Clock, Briefcase, Pen } from "lucide-react"
import { cn } from "@/lib/utils"

const formFields = [
  { icon: User, placeholder: "First Name", type: "text" },
  { icon: User, placeholder: "Last Name", type: "text" },
  { icon: Mail, placeholder: "E-Mail", type: "email" },
  { icon: Phone, placeholder: "Phone Number", type: "text" },
  { icon: MapPinned, placeholder: "Street", type: "text" },
  { icon: Info, placeholder: "Postal Code", type: "text" },
]

const selectFields = [
  {
    icon: Briefcase,
    placeholder: "Select Service",
    options: [
      "Move-Out Cleaning", "Move-In Cleaning", "Repairs & Maintenance", "Painting & Touch-Ups",
      "Carpet & Floor Cleaning", "Junk Removal", "Window Cleaning", "Pre-Sale Home Assistance"
    ],
  },
  {
    icon: MapPin,
    placeholder: "Select City",
    options: ["Toronto", "Ottawa", "Kitchener", "Guelph", "Hamilton", "London"],
  },
  {
    icon: Building,
    placeholder: "Nearest Branch",
    options: ["Toronto", "Ottawa", "Kitchener", "Guelph", "Hamilton", "London"],
  },
]

export default function BookingForm() {
  const [date, setDate] = useState<Date>()
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (files.length + newFiles.length <= 10) {
        setFiles((prev) => [...prev, ...newFiles])
      } else {
        alert("Maximum 10 images allowed")
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map(({ icon: Icon, placeholder, type }, index) => (
          <div key={index} className="relative">
            <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input type={type} placeholder={placeholder} className="pl-10 h-12" required />
          </div>
        ))}

        {selectFields.map(({ icon: Icon, placeholder, options }, index) => (
          <div key={index} className="relative">
            <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Select>
              <SelectTrigger className="pl-10 h-12">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option, i) => (
                  <SelectItem key={i} value={option.toLowerCase().replace(/\s+/g, "-")}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal pl-10 h-12", !date && "text-muted-foreground")}>{date ? format(date, "PPP") : "Date and Time"}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">Drag/Drop to Upload Media</p>
        <p className="text-xs text-red-400 mb-4">Maximum 10 images</p>
        <input type="file" id="file-upload" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
        <label htmlFor="file-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm">Select Files</label>
        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">{file.name}</div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Pen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Textarea placeholder="Special Instructions" className="pl-10 min-h-[100px]" />
      </div>

      <Button type="submit" className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white py-6 h-auto">BOOK NOW</Button>
    </form>
  )
}
