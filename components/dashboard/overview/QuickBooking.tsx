import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Clock, Building, Upload, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Import custom components
import { FormSelectWithIcon } from "@/components/dashboard/overview/FormWithIcon";
import { InputWithIcon } from "@/components/dashboard/overview/InputWithIcon";
import { CalendarComponent } from "@/components/dashboard/overview/Calendar";
import { PaymentModal } from "@/components/booking/payment-modal";
import { generateUniqueBookingId } from "@/lib/booking-id-generator";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

// Property details components
import { PropertyDetailsSimple } from "./PropertyDetailsSimple";
import { FileUpload } from "@/components/booking/file-upload";
import { FormStepIndicator, Step } from "@/components/booking/form-step-indicator";
import { PaymentOptions } from "@/components/booking/payment-options";

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

// Define the steps
const quickBookingSteps: Step[] = [
  { id: "booking-info", title: "Booking Info", description: "Service details and property info" },
  { id: "payment", title: "Payment", description: "Review and payment options" }
];

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

  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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

  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>("");
  const [bookingFormData, setBookingFormData] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<any[]>([]);
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [preparedFiles, setPreparedFiles] = useState<File[]>([]);

  // Price calculation effect
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
      calculateBookingPrice();
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  // Calculate pricing functions
  const calculateOriginalAmount = () => {
    if (!bookingData.service) return 0;

    const serviceObj = services.find(s => s.name === bookingData.service);
    if (!serviceObj) return 0;

    const servicePrice = typeof serviceObj.price === 'string'
      ? parseFloat(serviceObj.price.replace(/[^0-9.-]+/g, ""))
      : serviceObj.price;

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

    return servicePrice + additionalCost;
  };

  const calculateDepositAmount = () => {
    return calculateOriginalAmount() * 0.7;
  };

  const calculateFullPaymentAmount = () => {
    const originalAmount = calculateOriginalAmount();
    return originalAmount * 0.95; // 5% discount applied
  };

  const calculateBookingPrice = () => {
    const original = calculateOriginalAmount();
    const deposit = calculateDepositAmount();
    const fullPayment = calculateFullPaymentAmount();
    
    setTotalPrice(original);
    setFinalPaymentAmount(paymentOption === "full" ? fullPayment : deposit);
  };

  // Step validation
  const validateCurrentStep = () => {
    if (currentStep === 0) {
      // Validate booking info step
      const requiredFields = ['service', 'address', 'postalCode', 'branch', 'date'];
      const stepErrors: ErrorData = {};
      let hasErrors = false;

      requiredFields.forEach(field => {
        if (!bookingData[field as keyof BookingData]) {
          stepErrors[field as keyof ErrorData] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          hasErrors = true;
        }
      });

      if (bookingData.bedrooms < 0 || bookingData.bathrooms < 0) {
        stepErrors.bedrooms = "Valid number of bedrooms is required";
        stepErrors.bathrooms = "Valid number of bathrooms is required";
        hasErrors = true;
      }

      if (hasErrors) {
        setErrors(stepErrors);
        const firstError = Object.values(stepErrors).find(error => !!error);
        if (firstError) {
          toast.error(firstError);
        }
        return false;
      }
    }
    return true;
  };

  // Step navigation
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      setErrors(formattedErrors);
      const firstError = Object.values(formattedErrors).find(error => !!error);
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    if (calculateOriginalAmount() <= 0) {
      toast.error("Unable to calculate price. Please try again.");
      return;
    }

    setSubmitting(true);

    try {
      const userId = user?.id;
      const fullAddress = `${bookingData.address}, ${bookingData.postalCode}`;
      const serviceObj = services.find(s => s.id === bookingData.service);
      const serviceName = serviceObj?.name || bookingData.service;

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

      const propertyDetails = {
        bedrooms: bookingData.bedrooms,
        bathrooms: bookingData.bathrooms,
        livingRooms: bookingData.livingRooms,
        garages: bookingData.garages,
        den: bookingData.den,
      };

      const paymentAmount = paymentOption === "deposit"
        ? calculateDepositAmount()
        : calculateFullPaymentAmount();

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const newPreparedFiles = bookingData.images.map((file, index) => {
        const fileExt = file.name.split('.').pop();
        const uniqueName = `${bookingRef}_${index}_${timestamp}_${randomString}.${fileExt}`;
        return new File([file], uniqueName, { type: file.type });
      });

      setPreparedFiles(newPreparedFiles);

      const formData = {
        service_type: serviceName,
        user_id: userId,
        date: bookingData.date,
        address: fullAddress,
        reference_number: bookingRef,
        postal_code: bookingData.postalCode,
        branch_id: bookingData.branch,
        status: "confirmed",
        payment_status: "pending",
        payment_option: paymentOption,
        total_amount: paymentOption === "full" ? calculateFullPaymentAmount() : calculateOriginalAmount(),
        payment_amount: paymentAmount,
        property_details: propertyDetails,
        price_breakdown: priceBreakdown,
        notes: "",
        customer_name: user?.user_metadata?.firstName && user?.user_metadata?.lastName ?
          `${user.user_metadata.firstName} ${user.user_metadata.lastName}` : "Customer",
        customer_email: user?.email || "",
        phone: user?.user_metadata?.phone || "",
      };

      setBookingFormData(formData);
      setCurrentBookingId(bookingRef);
      setIsPaymentModalOpen(true);

    } catch (error) {
      console.error("Error preparing booking:", error);
      toast.error("Failed to prepare booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Create options
  const serviceOptions = services.map(service => ({
    value: service.id,
    label: service.name
  }));

  const branchOptions = branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  // Handle payment option change
  const handlePaymentOptionChange = (option: "full" | "deposit") => {
    setPaymentOption(option);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Booking Info
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Booking Information</h2>

            <FormSelectWithIcon
              icon={<CalendarClock className="h-5 w-5" />}
              placeholder="Select Service"
              options={serviceOptions}
              onChange={(value: string) => handleInputChange("service", value)}
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
              <FileUpload
                files={bookingData.images}
                setFiles={(newFiles) => handleInputChange("images", newFiles)}
                required={false}
                maxFiles={5}
                title="Upload Photos (Optional)"
                description="Click to upload or drag and drop"
                compact={true}
                showPreview={true}
                previewCols={3}
                className=""
              />
              {errors.images && (
                <p className="text-sm text-red-500">{errors.images}</p>
              )}
            </div>
          </div>
        );

      case 1: // Payment
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6">Review & Payment</h2>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">Booking Summary</h4>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Service:</div>
                <div className="font-medium">{services.find(s => s.id === bookingData.service)}</div>
                
                <div className="text-gray-600">Date:</div>
                <div className="font-medium">{bookingData.date || "Not selected"}</div>
                
                <div className="text-gray-600">Address:</div>
                <div className="font-medium">{bookingData.address}, {bookingData.postalCode}</div>
                
                <div className="text-gray-600">Property:</div>
                <div className="font-medium">
                  {bookingData.bedrooms} bedrooms, {bookingData.bathrooms} bathrooms
                  {bookingData.livingRooms > 0 ? `, ${bookingData.livingRooms} living areas` : ""}
                  {bookingData.garages > 0 ? `, ${bookingData.garages} garages` : ""}
                  {bookingData.den ? ", includes den" : ""}
                </div>
                
                <div className="text-gray-600">Photos:</div>
                <div className="font-medium">{bookingData.images.length} uploaded</div>
              </div>
            </div>

            {/* Payment Options */}
            <PaymentOptions
              selectedOption={paymentOption}
              onOptionChange={handlePaymentOptionChange}
              calculateFullPaymentAmount={calculateFullPaymentAmount}
              calculateDepositAmount={calculateDepositAmount}
              calculateOriginalAmount={calculateOriginalAmount}
              formatCurrency={formatCurrency}
              showServiceCheck={true}
              serviceSelected={!!bookingData.service}
              className="mt-4"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Step Indicator */}
          <FormStepIndicator
            steps={quickBookingSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Step Content */}
          <div className="bg-white p-6 rounded-lg border">
            {renderStepContent()}
          </div>

          {/* Step Controls */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep === quickBookingSteps.length - 1 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }}
                disabled={submitting}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
              >
                <span>{submitting ? "SUBMITTING..." : "BOOK NOW"}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToNextStep}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Calendar - Always visible on the right */}
        <div className=" p-6 ">
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <CalendarComponent
            onSelectDate={(date: string) => handleInputChange("date", date)}
            selectedBranch={bookingData.branch}
          />
          {errors.date && (
            <p className="text-sm text-red-500 mt-2">{errors.date}</p>
          )}
        </div>
      </div>

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