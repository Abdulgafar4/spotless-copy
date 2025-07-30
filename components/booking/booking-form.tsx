"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Form } from "@/components/ui/form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CalendarComponent } from "@/components/dashboard/overview/Calendar"
import { Pen } from "lucide-react"
import { generateUniqueBookingId } from "@/lib/booking-id-generator"

// Import custom components
import { PersonalInfoForm } from "./personal-info-form"
import { ServiceInfoForm } from "./service-info-form"
import { PropertyDetailsForm } from "./property-details-form"
import { FileUpload } from "./file-upload"
import { PriceBreakdown } from "./price-breakdown"
import { PaymentModal } from "./payment-modal"
import { calculatePrice } from "./price-calculator"
import { FormStepIndicator, Step } from "./form-step-indicator"
import { StepControls } from "./step-controls"
import { PaymentOptions } from "./payment-options"

// Import types
import { bookingFormSchema, BookingFormValues, Branch, Service, PriceBreakdownItem } from "./booking-types"
import { formatShortDate } from "@/lib/utils"

// Define form steps
const formSteps: Step[] = [
  { id: "personal-info", title: "Personal Info" },
  { id: "service-info", title: "Service Details" },
  { id: "property-details", title: "Property" },
  { id: "booking-date", title: "Schedule" },
  { id: "photos-notes", title: "Additional" },
  { id: "review-payment", title: "Review" }
]

export function MainBookingForm() {
  const router = useRouter()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Step management state
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // File upload state
  const [files, setFiles] = useState<File[]>([])

  // Payment and booking state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<string>("")
  const [bookingFormData, setBookingFormData] = useState<any>(null)

  // Pricing state
  const [totalPrice, setTotalPrice] = useState<any>(0)
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownItem[]>([])
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0)

  // Service data state
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)

  // Get URL parameters
  const serviceParam = searchParams.get("service")
  const branchParam = searchParams.get("branch")

  // Initialize form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      postalCode: "",
      service: serviceParam || "",
      branch: branchParam || "",
      date: "",
      notes: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      garages: 0,
      den: false,
      paymentOption: "full"
    },
    mode: "onChange" // Validate fields as they change
  })

  // Auto-fill user data when available
  useEffect(() => {
    if (user && user.user_metadata) {
      const { firstName, lastName, email, phone, address, postalCode } = user.user_metadata
      if (firstName && !form.getValues("firstName")) form.setValue("firstName", firstName)
      if (lastName && !form.getValues("lastName")) form.setValue("lastName", lastName)
      if (email && !form.getValues("email")) form.setValue("email", email)
      if (phone && !form.getValues("phone")) form.setValue("phone", phone)
      if (address && !form.getValues("street")) form.setValue("street", address)
      if (postalCode && !form.getValues("postalCode")) form.setValue("postalCode", postalCode)
    }
  }, [user, form])

  // Fetch services and branches data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch branches
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("*")
          .eq("status", "active")
          .order("name")

        if (branchesError) throw branchesError
        setBranches(branchesData || [])

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("status", "active")
          .order("name")

        if (servicesError) throw servicesError
        setServices(servicesData || [])
      } catch (error) {
        console.error("Data fetching error:", error)
        toast.error("Could not load services data. Please try again.")
      } finally {
        setServicesLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update price calculation when form values change
  useEffect(() => {
    const updatePrice = () => {
      const formValues = form.getValues()
      const { basePrice, totalPrice, priceBreakdown, finalPaymentAmount } = calculatePrice({
        formValues,
        services
      })

      setTotalPrice(totalPrice)
      setPriceBreakdown(priceBreakdown)
      setFinalPaymentAmount(finalPaymentAmount)
    }

    updatePrice()

    // Subscribe to form value changes
    const subscription = form.watch(() => {
      updatePrice()
    })

    return () => subscription.unsubscribe()
  }, [form, services])

  // Format currency values for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  // Payment Options Helper Functions
  const calculateOriginalAmount = () => {
    const formValues = form.getValues()

    if (!formValues.service) return 0

    // Use the price calculator to get original amount (before discount)
    const { totalPrice } = calculatePrice({
      formValues: {
        ...formValues,
        paymentOption: "deposit" // Use deposit to get original price without discount
      },
      services
    })

    return totalPrice
  }

  const calculateDepositAmount = () => {
    return calculateOriginalAmount() * 0.7
  }

  const calculateFullPaymentAmount = () => {
    const formValues = form.getValues()

    if (!formValues.service) return 0

    // Use the price calculator to get discounted full amount
    const { finalPaymentAmount } = calculatePrice({
      formValues: {
        ...formValues,
        paymentOption: "full"
      },
      services
    })

    return finalPaymentAmount
  }

  // Handle payment option change
  const handlePaymentOptionChange = (option: "full" | "deposit") => {
    form.setValue("paymentOption", option)
    // The useEffect will automatically recalculate prices
  }

  // Step validation
  const validateFields = async (fields: (keyof BookingFormValues)[]) => {
    const result = await form.trigger(fields)

    if (!result) {
      toast.error("Please complete all required fields before continuing")
    }

    return result
  }

  // Step navigation: Go to next step
  const goToNextStep = async (): Promise<boolean> => {
    // Validate current step fields
    let isValid = true

    switch (currentStep) {
      case 0: // Personal Info
        isValid = await validateFields(['firstName', 'lastName', 'email', 'phone'])
        break
      case 1: // Service Info
        isValid = await validateFields(['street', 'postalCode', 'service', 'branch'])
        break
      case 2: // Property Details
        isValid = await validateFields(['bedrooms', 'bathrooms', 'livingRooms', 'garages'])
        break
      case 3: // Booking Date
        isValid = await validateFields(['date'])
        break
      case 4: // Photos & Notes
        // Require at least one photo
        if (files.length === 0) {
          toast.error("Please upload at least one property photo")
          return false
        }
        isValid = true
        break
      case 5: // Review & Payment
        // Submit the form
        return await handleSubmitForm()
    }

    if (isValid) {
      // Mark step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }

      // Move to next step
      setCurrentStep(prev => prev + 1)
      return true
    }

    return false
  }

  // Step navigation: Go to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  // Submit the form and create booking
  const handleSubmitForm = async (): Promise<boolean> => {
    try {
      setIsFormSubmitting(true)

      // Validate all fields
      const isValid = await form.trigger()
      if (!isValid) {
        toast.error("Please complete all required fields")
        setIsFormSubmitting(false)
        return false
      }

      // Check if photos are uploaded
      if (files.length === 0) {
        toast.error("Please upload at least one property photo")
        setIsFormSubmitting(false)
        return false
      }

      const data = form.getValues()

      // Get user ID from auth context or use fallback
      const userId = user?.id || '28c45a61-4cd8-42e6-98cf-cdb7a7aa7475'
      const fullAddress = `${data.street}, ${data.postalCode}`
      const serviceObj = services.find(s => s.id === data.service)
      const serviceName = serviceObj?.name || data.service

      // Generate a unique booking reference number
      const { data: existingBookings, error: bookingsFetchError } = await supabase
        .from("bookings")
        .select("reference_number")
        .order("created_at", { ascending: false })
        .limit(100)

      if (bookingsFetchError) {
        console.error("Error fetching existing bookings:", bookingsFetchError)
      }

      const bookingRef = await generateUniqueBookingId(
        existingBookings?.map(booking => booking.reference_number) || []
      )

      // Prepare property details
      const propertyDetails = {
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        livingRooms: data.livingRooms,
        garages: data.garages,
        den: data.den,
      }

      // Determine payment amount based on option (70% deposit or full amount)
      const paymentAmount = data.paymentOption === "deposit"
        ? calculateDepositAmount()  // 70% deposit
        : calculateFullPaymentAmount()  // Full amount with 5% discount

      // Store all necessary booking data in state for later use after payment
      setBookingFormData({
        service_type: serviceName,
        user_id: userId,
        date: data.date,
        address: fullAddress,
        reference_number: bookingRef,
        postal_code: data.postalCode,
        branch_id: data.branch,
        status: "confirmed", // Will be set to confirmed since payment will be processed
        payment_status: "paid",
        payment_option: data.paymentOption,
        total_amount: data.paymentOption === "full" ? calculateFullPaymentAmount() : calculateOriginalAmount(),
        payment_amount: paymentAmount,
        property_details: propertyDetails,
        price_breakdown: priceBreakdown,
        notes: data.notes,
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_email: data.email,
        phone: data.phone,
      })

      setCurrentBookingId(bookingRef)

      // Show payment modal without creating the booking record yet
      setIsPaymentModalOpen(true)
      return true

    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Failed to submit booking. Please try again.")
      return false
    } finally {
      setIsFormSubmitting(false)
    }
  }

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return <PersonalInfoForm control={form.control} />

      case 1: // Service Info
        return (
          <ServiceInfoForm
            control={form.control}
            branches={branches}
            services={services}
            servicesLoading={servicesLoading}
            formatCurrency={formatCurrency}
          />
        )

      case 2: // Property Details
        return <PropertyDetailsForm control={form.control} />

      case 3: // Booking Date
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Service Date</h3>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  {/* <FormLabel>Preferred Date</FormLabel> */}
                  <FormControl>
                    <div className="bg-white rounded-lg border">
                      <CalendarComponent
                        onSelectDate={(date) => field.onChange(date)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case 4: // Photos & Notes
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Property Photos & Special Instructions</h3>
            <div className="space-y-4">
              <FileUpload
                files={files}
                setFiles={setFiles}
                required={true}
                maxFiles={10}
                title="Property Photos"
                description="Upload clear photos of your property"
                compact={false}
                showPreview={true}
                previewCols={2}
                className="mb-4"
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Pen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Textarea {...field} placeholder="Special Instructions" className="pl-10 min-h-[100px]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )

      case 5: // Review & Payment
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Review & Payment</h3>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Booking Summary</h4>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Service:</div>
                  <div className="font-medium">{services.find(s => s.id === form.getValues("service"))?.name}</div>

                  <div className="text-gray-600">Date:</div>
                  <div className="font-medium">{form.getValues("date") ? formatShortDate(form.getValues("date")) : "Not selected"}</div>

                  <div className="text-gray-600">Address:</div>
                  <div className="font-medium">{form.getValues("street")}, {form.getValues("postalCode")}</div>

                  <div className="text-gray-600">Property:</div>
                  <div className="font-medium">
                    {form.getValues("bedrooms")} bedrooms, {form.getValues("bathrooms")} bathrooms
                    {form.getValues("livingRooms") > 0 ? `, ${form.getValues("livingRooms")} living areas` : ""}
                    {form.getValues("garages") > 0 ? `, ${form.getValues("garages")} garages` : ""}
                    {form.getValues("den") ? ", includes den" : ""}
                  </div>

                  <div className="text-gray-600">Photos:</div>
                  <div className="font-medium">{files.length} uploaded</div>

                  {form.getValues("notes") && (
                    <>
                      <div className="text-gray-600">Notes:</div>
                      <div className="font-medium">{form.getValues("notes")}</div>
                    </>
                  )}
                </div>
              </div>

              {/* <PriceBreakdown
                priceBreakdown={priceBreakdown}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
              /> */}

              {/* Updated PaymentOptions component usage */}
              <PaymentOptions
                selectedOption={form.getValues("paymentOption")}
                onOptionChange={handlePaymentOptionChange}
                calculateFullPaymentAmount={calculateFullPaymentAmount}
                calculateDepositAmount={calculateDepositAmount}
                calculateOriginalAmount={calculateOriginalAmount}
                formatCurrency={formatCurrency}
                showServiceCheck={true}
                serviceSelected={!!form.getValues("service")}
                className="mt-6"
                fullPaymentLabel="Complete Payment"
                depositLabel="Partial Payment"
                fullPaymentDescription="Pay everything now with discount"
                depositDescription="Pay most now, rest after service completion"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-6 max-w-4xl mx-auto">
          <FormStepIndicator
            steps={formSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            {renderStepContent()}
          </div>

          <StepControls
            currentStep={currentStep}
            totalSteps={formSteps.length}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
            isSubmitting={isFormSubmitting}
            isLastStep={currentStep === formSteps.length - 1}
          />
        </form>
      </Form>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingRef={currentBookingId}
        paymentAmount={finalPaymentAmount}
        formatCurrency={formatCurrency}
        paymentOption={form.getValues("paymentOption")}
        totalAmount={totalPrice}
        bookingData={bookingFormData}
        files={files}
      />
    </>
  )
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-green-500"></div>
        <p className="text-sm text-gray-500">Loading booking form...</p>
      </div>
    </div>}>
      <MainBookingForm />
    </Suspense>
  )
}