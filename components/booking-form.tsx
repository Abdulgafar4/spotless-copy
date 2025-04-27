"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarComponent } from "@/components/dashboard/overview/Calendar"
import {
  Form,
  FormControl,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  MapPinned,
  Info,
  Briefcase,
  Pen,
  CreditCard,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { generateUniqueBookingId } from "@/lib/booking-id-generator"

// Define booking form schema
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
  date: z.string({ required_error: "Please select a date" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;
type Branch = { id: string, name: string };
type Service = { id: string, name: string, price: string | number, status: string };

const cities = [
  { value: "toronto", label: "Toronto" },
  { value: "ottawa", label: "Ottawa" },
  { value: "kitchener", label: "Kitchener" },
  { value: "guelph", label: "Guelph" },
  { value: "hamilton", label: "Hamilton" },
  { value: "london", label: "London" },
];

export function BookingFormContent() {
  const router = useRouter()
  const { user } = useAuth()

  const [files, setFiles] = useState<File[]>([])
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<string>("")
  const [bookingAmount, setBookingAmount] = useState<number>(0)

  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const searchParams = useSearchParams()


  const serviceParam = searchParams.get("service");
  const branchParam = searchParams.get("branch");

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
      city: "",
      branch: branchParam || "",
      date: "",
      notes: "",
    },
  });




  // Autofill user data
  useEffect(() => {
    if (user && user.user_metadata) {
      const { firstName, lastName, email, phone, address, postalCode, city } = user.user_metadata;
      if (firstName && !form.getValues("firstName")) form.setValue("firstName", firstName);
      if (lastName && !form.getValues("lastName")) form.setValue("lastName", lastName);
      if (email && !form.getValues("email")) form.setValue("email", email);
      if (phone && !form.getValues("phone")) form.setValue("phone", phone);
      if (address && !form.getValues("street")) form.setValue("street", address);
      if (postalCode && !form.getValues("postalCode")) form.setValue("postalCode", postalCode);
      if (city && !form.getValues("city")) form.setValue("city", city);
    }
  }, [user, form]);

  // Fetch branches and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: branchesData, error: branchesError } = await supabase
          .from("branches")
          .select("*")
          .eq("status", "active")
          .order("name");

        if (branchesError) throw branchesError;
        setBranches(branchesData || []);

        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("status", "active")
          .order("name");

        if (servicesError) throw servicesError;
        setServices(servicesData || []);
      } catch (error) {
        console.error("Fetching error:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Watch service field and update booking amount
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.service) {
        const service = services.find(s => s.id === value.service);
        if (service) {
          const price = typeof service.price === 'string'
            ? parseFloat(service.price.replace(/[^0-9.-]+/g, ""))
            : service.price;
          setBookingAmount(price);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [services, form]);

  // Helper: format currency

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length <= 10) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        toast.error("Maximum 10 images allowed");
      }
    }
  };


  // Form submit
  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsFormSubmitting(true);

      const bookingId = '28c45a61-4cd8-42e6-98cf-cdb7a7aa7475';
      const fullAddress = `${data.street}, ${data.city}, ${data.postalCode}`;
      const serviceObj = services.find(s => s.id === data.service);
      const serviceName = serviceObj?.name || data.service;

      const { data: existingBookings, error: bookingsFetchError } = await supabase
        .from("bookings")
        .select("reference_number")
        .order("created_at", { ascending: false })
        .limit(100);

      if (bookingsFetchError) {
        console.error("Error fetching existing bookings:", bookingsFetchError);
      }

      // Generate a unique booking reference number
      const bookingRef = await generateUniqueBookingId(
        existingBookings?.map(booking => booking.reference_number) || []
      );




      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            service_type: serviceName,
            user_id: bookingId,
            date: data.date,
            address: fullAddress,
            reference_number: bookingRef,
            city: data.city,
            postal_code: data.postalCode,
            branch_id: data.branch,
            status: "pending",
            payment_status: "unpaid",
            total_amount: bookingAmount,
            notes: data.notes,
            customer_name: `${data.firstName} ${data.lastName}`,
            customer_email: data.email,
            phone: data.phone,
          }
        ]);

      setCurrentBookingId(bookingRef);

      if (bookingError) throw bookingError;

      // Upload files
      if (files.length > 0) {
        for (const file of files) {
          const ext = file.name.split('.').pop();
          const path = `${bookingRef}`;
          const { error: uploadError } = await supabase.storage.from("booking_images").upload(path, file);
          if (uploadError) console.error("Upload error", uploadError);
        }
      }


      setIsPaymentModalOpen(true);

    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking. Try again.");
    } finally {
      setIsFormSubmitting(false);
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
                          {servicesLoading ? (
                            <SelectItem value="loading" disabled>Loading services...</SelectItem>
                          ) : services.filter(service => service.status === "active").map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(parseFloat(String(service.price)))}
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
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.name}>
                              {branch.name}
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

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred Date</FormLabel>
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

          <div className="space-y-4">
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
          </div>

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
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Booking
            </DialogTitle>
            <DialogDescription>
              Please transfer the booking amount to confirm your reservation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-xl font-bold">{formatCurrency(bookingAmount)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3">Bank Transfer Details</h3>
              <div className="space-y-2 text-blue-900">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Bank Name: Royal Bank of Canada (RBC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Account Name: Spotless Transitions Inc.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Account Number: 0123-4567890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Transit Number: 00123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Institution Number: 003</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important Information</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Please use your booking reference <strong>{currentBookingId}</strong> as the payment reference.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your booking will be confirmed within 24 hours after we verify your payment.
                    You will receive a confirmation email with the details of your booking.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
              <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                <li>Transfer the exact amount to our bank account</li>
                <li>Use your booking reference as the payment reference</li>
                <li>We'll verify your payment within 24 hours</li>
                <li>You'll receive a confirmation email once verified</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="sm:w-auto w-full"
            >
              Close
            </Button>

            <Button
              onClick={() => {
                // Mark the booking as pending payment and redirect
                setIsPaymentModalOpen(false);
                toast.success("Booking created! Please complete the bank transfer.");
                router.push("/dashboard/booking-history");
              }}
              className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
            >
              I'll Make the Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
}