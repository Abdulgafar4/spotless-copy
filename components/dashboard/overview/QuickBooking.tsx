import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Clock, Building, Upload, Home } from "lucide-react";
import { toast } from "sonner";

// Import custom components
import { FormSelectWithIcon } from "@/components/dashboard/overview/FormWithIcon";
import { InputWithIcon } from "@/components/dashboard/overview/InputWithIcon";
import { CalendarComponent } from "@/components/dashboard/overview/Calendar";
import { PaymentModal } from "@/components/booking/payment-modal";
import { calculatePrice } from "@/components/booking/price-calculator";
import { generateUniqueBookingId } from "@/lib/booking-id-generator";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

// Property details components
import { PropertyDetailsSimple } from "./PropertyDetailsSimple";

interface QuickBookingProps {
  services: any[];
  branches: any[];
  submitBooking: (data: any) => Promise<boolean>;
  loading: boolean;
}

interface BookingData {
  service: string;
  address: string;
  postalCode: string;
  branch: string;
  date: string;
  images: File[];
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  garages: number;
  den: boolean;
}

interface ErrorData {
  service?: string;
  address?: string;
  postalCode?: string;
  branch?: string;
  date?: string;
  images?: string;
  bedrooms?: string;
  bathrooms?: string;
}

// Schema for validation
const bookingSchema = z.object({
  service: z.string().nonempty("Service is required"),
  address: z.string().nonempty("Address is required"),
  postalCode: z.string().nonempty("Postal code is required"),
  branch: z.string().nonempty("Nearest branch is required"),
  date: z.string().nonempty("Date is required"),
  images: z.array(z.instanceof(File)).optional(),
  bedrooms: z.number().min(0, "Number of bedrooms is required"),
  bathrooms: z.number().min(0, "Number of bathrooms is required"),
  livingRooms: z.number().optional(),
  garages: z.number().optional(),
  den: z.boolean().optional(),
});

export function QuickBooking({ services, branches, submitBooking, loading }: QuickBookingProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Initialize state variables
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    address: "",
    postalCode: "",
    branch: "",
    date: "",
    images: [],
    bedrooms: 0,
    bathrooms: 0,
    livingRooms: 0,
    garages: 0,
    den: false,
  });
  
  const [errors, setErrors] = useState<ErrorData>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Payment state - match the initial values in the main form
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>("");
  const [bookingFormData, setBookingFormData] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<any[]>([]);
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [preparedFiles, setPreparedFiles] = useState<File[]>([]);

  // Add useEffect to calculate price whenever relevant booking data changes
  // This mirrors the approach used in MainBookingForm
  useEffect(() => {
    if (bookingData.service) {
      console.log("Price calculation triggered by useEffect with:", 
        { 
          service: bookingData.service, 
          bedrooms: bookingData.bedrooms, 
          bathrooms: bookingData.bathrooms,
          paymentOption 
        }
      );
      calculateBookingPrice(bookingData);
    }
  }, [
    bookingData.service,
    bookingData.bedrooms,
    bookingData.bathrooms,
    bookingData.livingRooms,
    bookingData.garages,
    bookingData.den,
    paymentOption,
    services
  ]);

  const handleInputChange = (field: string, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

 const createUniqueFile = (file: File): File => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    // Use crypto.randomUUID if available for even better uniqueness
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${timestamp}_${randomString}`;
    const fileExt = file.name.split('.').pop();
    const uniqueName = `booking_${uuid}.${fileExt}`;
    
    return new File([file], uniqueName, { type: file.type });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and create unique filenames
      const newImages = Array.from(e.target.files).map(file => createUniqueFile(file));
      
      console.log("Uploading files with unique names:", newImages.map(f => f.name));
      
      setBookingData((prev) => ({ 
        ...prev, 
        images: [...prev.images, ...newImages] 
      }));
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // Let's also add a function to check if files with similar names exist
  const ensureUniqueFileNames = (files: File[]): File[] => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    return files.map((file, index) => {
      // Create a completely new file with a unique name
      const fileExt = file.name.split('.').pop();
      const uniqueName = `file_${index}_${timestamp}_${randomString}.${fileExt}`;
      return new File([file], uniqueName, { type: file.type });
    });
  };


  const removeImage = (index: number) => {
    setBookingData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };
  // Updated calculate booking price function to use the current state
  const calculateBookingPrice = (data: BookingData) => {
    // Make sure we have the necessary data to calculate price
    if (!data.service) {
      console.log("No service selected, skipping price calculation");
      return;
    }
    
    const serviceObj = services.find(s => s.name === data.service);
    if (!serviceObj) {
      console.log("Service not found in services list:", data.service);
      return;
    }
    
    // Use the same approach as the main booking form
    const formValues = {
      service: data.service,
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      livingRooms: data.livingRooms || 0,
      garages: data.garages || 0,
      den: data.den || false,
      paymentOption: paymentOption
    };
    
    try {
      console.log("Calculating price with values:", formValues);
      
      const { basePrice, totalPrice, priceBreakdown, finalPaymentAmount } = calculatePrice({
        formValues,
        services
      });
      
      console.log("Quick Booking Price Calculation Result:", { 
        basePrice, 
        totalPrice, 
        finalPaymentAmount,
        priceBreakdown
      });
      
      setTotalPrice(totalPrice || 0);
      setPriceBreakdown(priceBreakdown || []);
      setFinalPaymentAmount(finalPaymentAmount || 0);
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Debug logging
    console.log("Form submitted with payment option:", paymentOption, totalPrice, finalPaymentAmount);
    console.log("Booking Data:", bookingData);
    console.log("Errors:", errors);
    
    // Force a final price calculation before submission
    calculateBookingPrice(bookingData);
    
    const result = bookingSchema.safeParse(bookingData);
    
    if (!result.success) {
      const newErrors = result.error.format();
      const formattedErrors = Object.keys(newErrors).reduce((acc: ErrorData, key) => {
        const typedKey = key as keyof ErrorData;
        const error = newErrors[key as keyof typeof newErrors];

        if (Array.isArray(error)) {
          acc[typedKey] = error[0];
        } else if (error?._errors) {
          acc[typedKey] = error._errors[0];
        }

        return acc;
      }, {});
      
      console.log("Validation errors:", formattedErrors);
      setErrors(formattedErrors);
      
      // Show error toast for validation issues
      const firstError = Object.values(formattedErrors).find(error => !!error);
      if (firstError) {
        toast.error(firstError);
      }
      
      return;
    }

    if (!bookingData.date) {
      setErrors(prev => ({ ...prev, date: "Please select a date for your booking" }));
      toast.error("Please select a date for your booking");
      return;
    }
    
    // Make sure we have calculated pricing
    if (totalPrice <= 0) {
      console.error("Total price is zero or negative, something went wrong with price calculation");
      toast.error("Unable to calculate price. Please try again.");
      return;
    }

    setSubmitting(true);
    
    try {
      // Get user ID from auth context or use fallback
      const userId = user?.id;
      const fullAddress = `${bookingData.address}, ${bookingData.postalCode}`;
      const serviceObj = services.find(s => s.id === bookingData.service);
      const serviceName = serviceObj?.name || bookingData.service;

      // Generate a unique booking reference number - same as before
      const { data: existingBookings, error: bookingsFetchError } = await supabase
        .from("bookings")
        .select("reference_number")
        .order("created_at", { ascending: false })
        .limit(100);

      if (bookingsFetchError) {
        console.error("Error fetching existing bookings:", bookingsFetchError);
      }

      const bookingRef = await generateUniqueBookingId(
        existingBookings?.map(booking => booking.reference_number) || []
      );

      // Prepare property details - same as before
      const propertyDetails = {
        bedrooms: bookingData.bedrooms,
        bathrooms: bookingData.bathrooms,
        livingRooms: bookingData.livingRooms,
        garages: bookingData.garages,
        den: bookingData.den,
      };

      // Determine payment amount based on option (70% deposit or full amount)
      const paymentAmount = paymentOption === "deposit"
        ? totalPrice * 0.7  // 70% deposit
        : finalPaymentAmount;  // Full amount with 5% discount already applied

      // Create unique file names to avoid duplicates
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const newPreparedFiles = bookingData.images.map((file, index) => {
        // Create a new file with a unique name to avoid Supabase storage conflicts
        const fileExt = file.name.split('.').pop();
        // Add both timestamp and random string to ensure uniqueness
        const uniqueName = `${bookingRef}_${index}_${timestamp}_${randomString}.${fileExt}`;
        return new File([file], uniqueName, { type: file.type });
      });
      
      console.log("Creating prepared files with unique names:", newPreparedFiles.map(f => f.name));
      
      // Store the prepared files in state
      setPreparedFiles(newPreparedFiles);
      
      console.log("Prepared Files:", newPreparedFiles);

      // Create booking form data for payment modal
      const formData = {
        service_type: serviceName,
        user_id: userId,
        date: bookingData.date,
        address: fullAddress,
        reference_number: bookingRef,
        postal_code: bookingData.postalCode,
        branch_id: bookingData.branch,
        status: "confirmed", // Will be set to confirmed after payment
        payment_status: "pending", // Start as pending until payment is complete
        payment_option: paymentOption,
        total_amount: totalPrice,
        payment_amount: paymentAmount,
        property_details: propertyDetails,
        price_breakdown: priceBreakdown,
        notes: "",
        customer_name: user?.user_metadata?.firstName && user?.user_metadata?.lastName ? 
                      `${user.user_metadata.firstName} ${user.user_metadata.lastName}` : "Customer",
        customer_email: user?.email || "",
        phone: user?.user_metadata?.phone || "",
      };
      
      console.log("Booking Form Data:", formData);
      
      // Set the booking form data
      setBookingFormData(formData);
      
      // Set the current booking ID
      setCurrentBookingId(bookingRef);
      
      // Open payment modal
      setIsPaymentModalOpen(true);
      
    } catch (error) {
      console.error("Error preparing booking:", error);
      toast.error("Failed to prepare booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  // Create service options from real services data
  const serviceOptions = services.map(service => ({
    value: service.id,
    label: service.name
  }));

  // Create branch options from real branches data
  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));
  
  // Log services and branches once on mount for debugging
  useEffect(() => {
    console.log("Available services:", services);
    console.log("Available branches:", branches);
  }, [services, branches]);
  
  // Handle payment option change
  const handlePaymentOptionChange = (option: "full" | "deposit") => {
    console.log("Payment option changed to:", option);
    setPaymentOption(option);
    // Don't call calculateBookingPrice here - useEffect will handle it
  };

    const calculateDepositAmount = () => {
    // If there's no service selected yet, return 0
    if (!bookingData.service) return 0;
    
    // Find the service
    const serviceObj = services.find(s => s.name === bookingData.service);
    if (!serviceObj) return 0;
    
    // Get service price
    const servicePrice = typeof serviceObj.price === 'string'
      ? parseFloat(serviceObj.price.replace(/[^0-9.-]+/g, ""))
      : serviceObj.price;
    
    // Calculate additional costs for rooms
    const extraPricePerRoom = 20;
    let additionalCost = 0;
    
    if (bookingData.bedrooms > 0) {
      additionalCost += bookingData.bedrooms * extraPricePerRoom;
    }
    
    if (bookingData.bathrooms > 0) {
      additionalCost += bookingData.bathrooms * extraPricePerRoom;
    }
    
    if (bookingData.livingRooms > 0) {
      additionalCost += bookingData.livingRooms * extraPricePerRoom;
    }
    
    if (bookingData.garages > 0) {
      additionalCost += bookingData.garages * extraPricePerRoom;
    }
    
    if (bookingData.den) {
      additionalCost += extraPricePerRoom;
    }
    
    // Calculate original subtotal (before any discount)
    const subtotal = servicePrice + additionalCost;
    
    // Calculate 70% deposit from the original price
    return subtotal * 0.7;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-10 mt-2">QUICK BOOKING</h2>
          
          <FormSelectWithIcon
            icon={<CalendarClock className="h-5 w-5" />}
            placeholder="Select Service"
            options={serviceOptions}
            onChange={(value: string) => {
              console.log("Service selected:", value);
              handleInputChange("service", value);
              // No need to force immediate price calculation - useEffect will handle it
            }}
            error={errors.service}
          />

          <InputWithIcon
            icon={<MapPin className="h-5 w-5" />}
            placeholder="Address Street"
            onChange={(e: any) => handleInputChange("address", e.target.value)}
            error={errors.address}
          />

          <InputWithIcon
            icon={<Clock className="h-5 w-5" />}
            placeholder="Postal Code"
            onChange={(e: any) => handleInputChange("postalCode", e.target.value)}
            error={errors.postalCode}
          />

          <FormSelectWithIcon
            icon={<Building className="h-5 w-5" />}
            placeholder="Nearest Branch"
            options={branchOptions}
            onChange={(value: any) => handleInputChange("branch", value)}
            error={errors.branch}
          />
          
          {/* Property Details Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Property Details
            </h3>
            
            <PropertyDetailsSimple 
              bookingData={bookingData}
              handleInputChange={handleInputChange}
              errors={errors}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload Photos (Optional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-6 h-6 mb-1 text-gray-500" />
                  <p className="mb-1 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, or JPEG (MAX. 5MB)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>
            {errors.images && (
              <p className="text-sm text-red-500">{errors.images}</p>
            )}
            
            {/* Preview uploaded images */}
            {bookingData.images.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Uploaded Images ({bookingData.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {bookingData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="h-16 w-full rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Options */}
          {bookingData.service && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">Payment Options</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="payment-full"
                    name="paymentOption"
                    className="h-4 w-4 text-green-600"
                    checked={paymentOption === "full"}
                    onChange={() => handlePaymentOptionChange("full")}
                  />
                  <label htmlFor="payment-full" className="ml-2 text-sm">
                    Full Payment ({formatCurrency(finalPaymentAmount || 0)})
                    {paymentOption === "full" && totalPrice > 0 && (
                      <span className="ml-1 text-xs text-green-600">(5% discount applied)</span>
                    )}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="payment-deposit"
                    name="paymentOption"
                    className="h-4 w-4 text-green-600"
                    checked={paymentOption === "deposit"}
                    onChange={() => handlePaymentOptionChange("deposit")}
                  />
                  <label htmlFor="payment-deposit" className="ml-2 text-sm">
                    70% Deposit ({formatCurrency(calculateDepositAmount())})
                  </label>
                </div>
                {bookingData.service && (
                  <div className="mt-1 text-xs font-medium text-green-600 text-right">
                    Total: {formatCurrency(totalPrice || 0)}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white mt-4"
            disabled={submitting}
          >
            {submitting ? "SUBMITTING..." : "BOOK NOW"}
          </Button>
        </div>
        
        <CalendarComponent 
          onSelectDate={(date: string) => handleInputChange("date", date)} 
        />
      </form>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingRef={currentBookingId}
        paymentAmount={finalPaymentAmount}
        formatCurrency={formatCurrency}
        paymentOption={paymentOption}
        totalAmount={totalPrice}
        bookingData={bookingFormData}
        files={preparedFiles.length > 0 ? preparedFiles : bookingData.images}
      />
    </>
  );
}