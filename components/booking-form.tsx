"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/use-auth"
import { usePayments } from "@/hooks/use-payments"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  MapPinned, 
  Info, 
  Clock, 
  Briefcase, 
  Pen,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define our booking form schema
const bookingFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  street: z.string().min(5, { message: "Street address is required" }),
  postalCode: z.string().min(5, { message: "Valid postal code is required" }),
  service: z.string({ required_error: "Please select a service" }),
  city: z.string({ required_error: "Please select a city" }),
  branch: z.string({ required_error: "Please select a branch" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const services = [
  { value: "move-out-cleaning", label: "Move-Out Cleaning", price: 350 },
  { value: "move-in-cleaning", label: "Move-In Cleaning", price: 350 },
  { value: "repairs-maintenance", label: "Repairs & Maintenance", price: 250 },
  { value: "painting-touchups", label: "Painting & Touch-Ups", price: 300 },
  { value: "carpet-floor-cleaning", label: "Carpet & Floor Cleaning", price: 225 },
  { value: "junk-removal", label: "Junk Removal", price: 200 },
  { value: "window-cleaning", label: "Window Cleaning", price: 275 },
  { value: "pre-sale-home", label: "Pre-Sale Home Assistance", price: 450 },
];

const cities = [
  { value: "toronto", label: "Toronto" },
  { value: "ottawa", label: "Ottawa" },
  { value: "kitchener", label: "Kitchener" },
  { value: "guelph", label: "Guelph" },
  { value: "hamilton", label: "Hamilton" },
  { value: "london", label: "London" },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export default function BookingForm() {
  const [date, setDate] = useState<Date>()
  const [files, setFiles] = useState<File[]>([])
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<string>("")
  const [bookingAmount, setBookingAmount] = useState<number>(0)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()
  const { paymentMethods, createPaymentSession, processPaymentWithSavedMethod, loading: paymentsLoading } = usePayments()

  // Set up form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      postalCode: "",
      service: "",
      city: "",
      branch: "",
      date: undefined,
      time: "",
      notes: "",
    },
  });

  // Fill form with user data if logged in
  useEffect(() => {
    if (user && user.user_metadata) {
      const { firstName, lastName, email, phone, address, postalCode, city } = user.user_metadata;
      
      // Only set values that exist and if the corresponding field is empty
      if (firstName && !form.getValues("firstName")) form.setValue("firstName", firstName);
      if (lastName && !form.getValues("lastName")) form.setValue("lastName", lastName);
      if (email && !form.getValues("email")) form.setValue("email", email);
      if (phone && !form.getValues("phone")) form.setValue("phone", phone);
      if (address && !form.getValues("street")) form.setValue("street", address);
      if (postalCode && !form.getValues("postalCode")) form.setValue("postalCode", postalCode);
      if (city && !form.getValues("city")) form.setValue("city", city);
    }
  }, [user, form]);

  // Calculate booking amount when service changes
  useEffect(() => {
    const selectedService = form.watch("service");
    if (selectedService) {
      const service = services.find(s => s.value === selectedService);
      if (service) {
        setBookingAmount(service.price);
      }
    }
  }, [form.watch("service")]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (files.length + newFiles.length <= 10) {
        setFiles((prev) => [...prev, ...newFiles])
      } else {
        toast.error("Maximum 10 images allowed")
      }
    }
  }

  // Handle form submission
  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsFormSubmitting(true);
      
      // Check if user is logged in
      if (!user) {
        toast.error("You must be logged in to make a booking");
        router.push("/login?redirect=/booking");
        return;
      }
      
      // Create a unique ID for the booking
      const bookingId = uuidv4();
      
      // Format the service name for display
      const serviceObj = services.find(s => s.value === data.service);
      const serviceName = serviceObj?.label || data.service;
      
      // Format address
      const fullAddress = `${data.street}, ${data.city}, ${data.postalCode}`;
      
      // Create booking record in Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            id: bookingId,
            user_id: user.id,
            service_type: serviceName,
            service_code: data.service,
            date: format(data.date, "yyyy-MM-dd"),
            time: data.time || "To be determined",
            address: fullAddress,
            city: data.city,
            postal_code: data.postalCode,
            branch: data.branch,
            status: "draft", // Initial status before payment
            payment_status: "unpaid",
            total_amount: bookingAmount,
            notes: data.notes,
            customer_name: `${data.firstName} ${data.lastName}`,
            customer_email: data.email,
            customer_phone: data.phone,
          }
        ])
        .select();
        
      if (bookingError) {
        throw bookingError;
      }
      
      // If files were uploaded, store them
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${bookingId}/${uuidv4()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("booking_images")
            .upload(fileName, file);
            
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            // Continue with other files
          }
        }
      }
      
      // Set current booking ID for payment processing
      setCurrentBookingId(bookingId);
      setIsPaymentModalOpen(true);
      
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsFormSubmitting(false);
    }
  };
  
  // Process payment with saved method
  const handlePayWithSavedMethod = async () => {
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }
    
    setIsPaymentProcessing(true);
    
    try {
      const success = await processPaymentWithSavedMethod({
        booking_id: currentBookingId,
        payment_method_id: selectedPaymentMethodId,
        amount: bookingAmount,
        return_url: `${window.location.origin}/payment/success`
      });
      
      if (success) {
        toast.success("Payment successful!");
        router.push(`/payment/success?booking_id=${currentBookingId}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // Process payment with new method (redirect to Stripe)
  const handlePayWithNewMethod = async () => {
    setIsPaymentProcessing(true);
    
    try {
      const sessionData = await createPaymentSession({
        booking_id: currentBookingId,
        amount: bookingAmount,
        return_url: `${window.location.origin}/payment/success`
      });
      
      if (sessionData && sessionData.url) {
        // Redirect to Stripe checkout
        window.location.href = sessionData.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment session error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsPaymentProcessing(false);
    }
  };
  
  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="First Name" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="Last Name" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="E-Mail" type="email" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="Phone Number" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <h3 className="text-lg font-semibold mb-4 mt-8">Service Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="pl-10 h-12">
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              {service.label} - {formatCurrency(service.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="pl-10 h-12">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinned className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="Street Address" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input {...field} placeholder="Postal Code" className="pl-10 h-12" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nearest Branch</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="pl-10 h-12">
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Preferred Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal h-12",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-gray-400" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // Disable dates in the past
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger className="pl-10 h-12">
                          <SelectValue placeholder="Select Time (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
            <p className="text-sm text-gray-600 mb-2">Drag/Drop to Upload Media (Optional)</p>
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
          
          <Button 
            type="submit" 
            className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white py-6 h-auto"
            disabled={isFormSubmitting}
          >
            {isFormSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "BOOK NOW"
            )}
          </Button>
        </form>
      </Form>
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Booking
            </DialogTitle>
            <DialogDescription>
              Please make a payment to confirm your booking
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold">{formatCurrency(bookingAmount)}</span>
              </div>
            </div>
            
            {paymentMethods && paymentMethods.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Select Payment Method</h3>
                {useNewPaymentMethod ? (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <span>New Payment Method</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setUseNewPaymentMethod(false)}>
                        Use Saved Method
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      You'll be redirected to our secure payment provider to complete your payment.
                    </p>
                  </div>
                ) : (
                  <>
                    {paymentMethods.map((method) => (
                      <div 
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedPaymentMethodId === method.id ? "border-blue-500 bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedPaymentMethodId(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            <div>
                              {method.type === "credit_card" && (
                                <p>{method.details.brand} •••• {method.details.last4}</p>
                              )}
                              {method.type === "paypal" && (
                                <p>PayPal - {method.details.email}</p>
                              )}
                              {method.is_default && (
                                <span className="text-xs text-blue-600">Default</span>
                              )}
                            </div>
                          </div>
                          {selectedPaymentMethodId === method.id && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => setUseNewPaymentMethod(true)}
                    >
                      Use New Payment Method
                    </Button>
                  </>
                )}
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important Information</h4>
                  <p className="text-sm text-yellow-700">
                    Your booking will only be confirmed after the payment is successfully processed. 
                    You will receive a confirmation email with the details of your booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isPaymentProcessing}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            
            {useNewPaymentMethod || paymentMethods.length === 0 ? (
              <Button 
                onClick={handlePayWithNewMethod}
                disabled={isPaymentProcessing}
                className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(bookingAmount)}
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handlePayWithSavedMethod}
                disabled={isPaymentProcessing || !selectedPaymentMethodId}
                className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(bookingAmount)}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}