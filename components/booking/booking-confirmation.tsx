"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Calendar, MapPin, Loader2, ImageIcon } from "lucide-react"
import { formatShortDate } from "@/lib/utils"
import DashboardLayout from "../dashboard/dashboard-layout"
import Image from "next/image"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingRef = searchParams.get("ref")
    const [booking, setBooking] = useState<any>(null)
  const [bookingImages, setBookingImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingRef) {
        setError("No booking reference provided")
        setLoading(false)
        return
      }

      try {
        // First, get the booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("reference_number", bookingRef)
          .single()

        if (bookingError) throw bookingError
        
        // If the booking has a branch_id, fetch the branch name separately
        let branchData = null
        if (bookingData.branch_id) {
          const { data: branch, error: branchError } = await supabase
            .from("branches")
            .select("name")
            .eq("id", bookingData.branch_id)
            .single()
            
          if (!branchError) {
            branchData = branch
          }
        }
        
        // Fetch booking images if available
        if (bookingData.id) {
          const { data: images, error: imagesError } = await supabase
            .from("booking_images")
            .select("image_url")
            .eq("booking_id", bookingData.id)
            .order('created_at', { ascending: true })
          
          if (!imagesError && images && images.length > 0) {
            setBookingImages(images.map((img: { image_url: string }) => img.image_url))
          }
        }
        
        // Combine the data
        setBooking({
          ...bookingData,
          branches: branchData
        })
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Could not find booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingRef])


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index)
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => 
      prevIndex === 0 ? bookingImages.length - 1 : prevIndex - 1
    )
  }

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => 
      prevIndex === bookingImages.length - 1 ? 0 : prevIndex + 1
    )
  }

 return (
  <DashboardLayout>
    {loading ? (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    ) : error || !booking ? (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Booking Not Found</CardTitle>
            <CardDescription>We couldn't locate the booking details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error || "Please check your booking reference and try again"}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    ) : (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="border-green-200 shadow-md">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Check className="h-6 w-6" />
              <span className="text-sm font-medium uppercase">Booking Confirmed</span>
            </div>
            <CardTitle>Booking Confirmation</CardTitle>
            <CardDescription>Reference #: {booking.reference_number}</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
             {bookingImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Property Images</h3>
              
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <div className="aspect-w-16 aspect-h-9 relative h-72">
                  <Image
                    src={bookingImages[activeImageIndex]} 
                    alt={`Booking image ${activeImageIndex + 1}`}
                    className="object-cover"
                    fill
                    priority
                  />
                </div>
                
                {bookingImages.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={handlePrevImage}
                    >
                      <span className="sr-only">Previous</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                      onClick={handleNextImage}
                    >
                      <span className="sr-only">Next</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.1584 3.13514C6.35986 2.94628 6.67627 2.95648 6.86514 3.15794L10.6151 7.15794C10.7954 7.35027 10.7954 7.64955 10.6151 7.84188L6.86514 11.8419C6.67627 12.0433 6.35986 12.0535 6.1584 11.8647C5.95694 11.6758 5.94673 11.3594 6.1356 11.1579L9.56501 7.49991L6.1356 3.84188C5.94673 3.64042 5.95694 3.32401 6.1584 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
              
              {bookingImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {bookingImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer ${
                        activeImageIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleImageClick(index)}
                    >
                      <Image 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="object-cover"
                        fill
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {bookingImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 text-center">No images available for this booking</p>
            </div>
          )}
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Service Details</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 mt-0.5">
                      {booking.service_type}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 mt-0.5">
                      {booking.branches?.name || "Unknown Branch"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatShortDate(booking.date)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{booking.address}</span>
                  </div>
                </div>
                
                {booking.property_details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Property Details</h4>
                    <div className="text-sm text-gray-700">
                      {booking.property_details.bedrooms} bedrooms, {booking.property_details.bathrooms} bathrooms
                      {booking.property_details.livingRooms > 0 ? `, ${booking.property_details.livingRooms} living areas` : ""}
                      {booking.property_details.garages > 0 ? `, ${booking.property_details.garages} garages` : ""}
                      {booking.property_details.den ? ", includes den" : ""}
                    </div>
                  </div>
                )}
                
                {booking.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Special Instructions</h4>
                    <div className="text-sm text-gray-700">{booking.notes}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Payment Information</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">{formatCurrency(booking.total_amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status</span>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      {booking.payment_status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                  
                  {booking.payment_option === "deposit" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remaining Balance</span>
                      <span className="font-medium">{formatCurrency(booking.total_amount - booking.payment_amount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Amount Paid</span>
                    <span className="text-lg font-bold">{formatCurrency(booking.payment_amount)}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>
                    A confirmation email has been sent to {booking.customer_email} with all booking details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button asChild variant="outline">
              <Link href="/dashboard/booking-history">View Booking History</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )}
  </DashboardLayout>
)
}