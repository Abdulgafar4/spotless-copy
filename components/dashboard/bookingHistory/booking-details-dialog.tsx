// components/dashboard/bookingHistory/booking-details-dialog.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Building, 
  CreditCard, 
  ArrowRight, 
  ImageIcon,
  User,
  Home,
  FileText,
  Bed,
  Bath,
  Car,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Booking } from "@/hooks/use-client-bookings";
import { useRouter } from "next/navigation";
import { formatLongDate, formatTime } from "@/lib/utils";
import Image from "next/image";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onRebook?: (serviceType: string, branchId: string) => Promise<void>;
}

export function BookingDetailsDialog({
  booking,
  isOpen,
  onClose,
  onRebook
}: BookingDetailsDialogProps) {
  const router = useRouter();
  const [isRebooking, setIsRebooking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  if (!booking) return null;

  const statusConfig = {
    completed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Completed",
      description: "Service has been successfully completed."
    },
    confirmed: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Confirmed",
      description: "Your booking has been confirmed and scheduled."
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      description: "Your booking request is being reviewed."
    },
    cancelled: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Cancelled",
      description: "This booking has been cancelled."
    },
    "in-progress": {
      className: "bg-purple-100 text-purple-800 border-purple-200",
      label: "In Progress",
      description: "Service is currently in progress."
    }
  };

  const paymentStatusConfig = {
    paid: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Paid",
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
    },
    refunded: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Refunded",
    },
    unpaid: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Unpaid",
    },
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  // Parse booking images
  const getBookingImages = () => {
    if (!booking.images) return [];
    
    try {
      if (typeof booking.images === 'string') {
        return JSON.parse(booking.images);
      }
      return Array.isArray(booking.images) ? booking.images : [];
    } catch (error) {
      console.error("Error parsing booking images:", error);
      return [];
    }
  };

  // Parse property details
  const getPropertyDetails = () => {
    if (!booking.property_details) return null;
    
    try {
      if (typeof booking.property_details === 'string') {
        return JSON.parse(booking.property_details);
      }
      return booking.property_details;
    } catch (error) {
      console.error("Error parsing property details:", error);
      return null;
    }
  };

  const bookingImages = getBookingImages();
  const propertyDetails = getPropertyDetails();

  // Image navigation handlers
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => 
      prev === 0 ? bookingImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => 
      prev === bookingImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleRebook = async () => {
    if (onRebook && booking.service_type && booking.branch) {
      setIsRebooking(true);
      try {
        await onRebook(booking.service_type, booking.branch);
        onClose();
      } catch (error) {
        console.error("Error rebooking service", error);
      } finally {
        setIsRebooking(false);
      }
    }
  };

  const status = booking.status.toLowerCase() as keyof typeof statusConfig;
  const statusDisplay = statusConfig[status] || statusConfig.pending;
  
  const paymentStatus = booking.payment_status?.toLowerCase() as keyof typeof paymentStatusConfig;
  const paymentStatusDisplay = paymentStatusConfig[paymentStatus] || paymentStatusConfig.pending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Booking Details</span>
            <Badge className={statusDisplay.className}>
              {statusDisplay.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Booking #{booking.reference_number} • {formatLongDate(booking.date)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full max-w-[300px] mx-auto">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Service Information
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                        {booking.service_type}
                      </Badge>
                    </div>
                    
                    {booking.branch && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{booking.branch}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatLongDate(booking.date)}</span>
                    </div>
                    
                    {booking.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>{booking.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                {propertyDetails && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Property Details
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Bed className="h-4 w-4 text-gray-500" />
                          <span>Bedrooms: {propertyDetails.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Bath className="h-4 w-4 text-gray-500" />
                          <span>Bathrooms: {propertyDetails.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>Living Rooms: {propertyDetails.livingRooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-gray-500" />
                          <span>Garages: {propertyDetails.garages || 0}</span>
                        </div>
                        {propertyDetails.den && (
                          <div className="flex items-center gap-2 text-sm col-span-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>Includes Den</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Assigned */}
                {booking.staff_assigned && booking.staff_assigned.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Staff Assigned
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <ul className="space-y-2">
                        {booking.staff_assigned.map((staff, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>{staff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Special Instructions</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{booking.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status and Payment Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Booking Status</h4>
                  <div className={`p-4 rounded-lg ${statusDisplay.className.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')}`}>
                    <h5 className="font-medium text-lg">{statusDisplay.label}</h5>
                    <p className="text-sm mt-1 opacity-90">{statusDisplay.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Payment Summary</h4>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Amount</span>
                      <span className="font-bold text-lg">{formatCurrency(booking.total_amount)}</span>
                    </div>
                    
                    {booking.payment_amount && booking.payment_amount !== booking.total_amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount Paid</span>
                        <span className="font-medium">{formatCurrency(booking.payment_amount)}</span>
                      </div>
                    )}

                    {booking.payment_option === "deposit" && booking.payment_amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Remaining Balance</span>
                        <span className="font-medium text-orange-600">
                          {formatCurrency((booking.total_amount || 0) - booking.payment_amount)}
                        </span>
                      </div>
                    )}
                    
                    {booking.payment_status && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <Badge className={paymentStatusDisplay.className}>
                          {paymentStatusDisplay.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            {bookingImages.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Property Images</h3>

                {/* Main Image Display */}
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <div className="aspect-w-16 aspect-h-9 relative h-96">
                    <Image
                      src={bookingImages[activeImageIndex]}
                      alt={`Property image ${activeImageIndex + 1}`}
                      className="object-cover"
                      fill
                      priority
                    />
                  </div>

                  {/* Navigation Arrows */}
                  {bookingImages.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Image Counter */}
                  {bookingImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {activeImageIndex + 1} / {bookingImages.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid */}
                {bookingImages.length > 1 && (
                  <div className="grid grid-cols-6 gap-2">
                    {bookingImages.map((image: string, index: number) => (
                      <div
                        key={index}
                        className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                          activeImageIndex === index 
                            ? 'ring-2 ring-green-500 opacity-100' 
                            : 'opacity-70 hover:opacity-100'
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No Images Available</h3>
                <p className="text-gray-400 text-center max-w-md">
                  No property images were uploaded for this booking.
                </p>
              </div>
            )}
          </TabsContent>


        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {(booking.status === "completed" || booking.status === "cancelled") && onRebook && (
            <Button
              variant="outline"
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
              onClick={handleRebook}
              disabled={isRebooking}
            >
              <Calendar className="h-4 w-4 mr-1" />
              {isRebooking ? "Processing..." : "Book Again"}
            </Button>
          )}
          
          {booking.status === "confirmed" && (
            <Button
              variant="outline"
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              onClick={() => {
                onClose();
                router.push("/dashboard/cancellation");
              }}
            >
              Request Cancellation
            </Button>
          )}
          
          {booking.payment_status === "unpaid" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onClose();
                router.push("/dashboard/payments");
              }}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Make Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}