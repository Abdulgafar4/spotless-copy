"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MessageSquare } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({ name: "", email: "", phone: "", message: "" })
    // Show success message
    alert("Message sent successfully!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 p-3 border-r border-gray-300">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        <Input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 p-3 border-r border-gray-300">
          <Mail className="h-5 w-5 text-gray-500" />
        </div>
        <Input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 p-3 border-r border-gray-300">
          <Phone className="h-5 w-5 text-gray-500" />
        </div>
        <Input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex items-start border border-gray-300 rounded-md overflow-hidden">
        <div className="bg-gray-100 p-3 border-r border-gray-300">
          <MessageSquare className="h-5 w-5 text-gray-500" />
        </div>
        <Textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
        SEND MESSAGE
      </Button>
    </form>
  )
}

