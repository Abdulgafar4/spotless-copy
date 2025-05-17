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
  FormDescription,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  AlertTriangle,
  Home,
  BedDouble,
  Bath,
  Sofa,
  DoorClosed,
  CarFront,
  Calculator,
  FileUp,
  FileX,
  AlertCircle,
  Percent,
  Receipt,
} from "lucide-react"
import { generateUniqueBookingId } from "@/lib/booking-id-generator"

// Enhanced booking form schema with property details
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
  // New property details fields
  bedrooms: z.coerce.number().min(0).max(10),
  bathrooms: z.coerce.number().min(0).max(10),
  livingRooms: z.coerce.number().min(0).max(5),
  garages: z.coerce.number().min(0).max(3),
  den: z.boolean().optional().default(false),
  // Payment option
  paymentOption: z.enum(["full", "deposit"])
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

// File type validation
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function BookingFormContent() {
  const router = useRouter()
  const { user } = useAuth()

  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [currentBookingId, setCurrentBookingId] = useState<string>("")
  const [basePrice, setBasePrice] = useState<number>(0)
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [priceBreakdown, setPriceBreakdown] = useState<{item: string, price: number}[]>([])
  const [finalPaymentAmount, setFinalPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<string>("bank")

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
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      garages: 0,
      den: false,
      paymentOption: "full"
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

  // Calculate total price based on form values
  useEffect(() => {
    const calculatePrice = () => {
      const values = form.getValues();
      const service = services.find(s => s.id === values.service);
      
      if (!service) {
        setBasePrice(0);
        setTotalPrice(0);
        setPriceBreakdown([]);
        return;
      }
      
      // Convert service price to number
      const servicePrice = typeof service.price === 'string'
        ? parseFloat(service.price.replace(/[^0-9.-]+/g, ""))
        : service.price;
      
      setBasePrice(servicePrice);
      
      // Initialize price breakdown with base price
      const breakdown = [
        { item: `Base price (${service.name})`, price: servicePrice }
      ];
      
      // Add price for additional rooms
      const extraPricePerRoom = 20; // $20 per additional room/feature
      
      let additionalCost = 0;
      
      if (values.bedrooms > 0) {
        const bedroomsPrice = values.bedrooms * extraPricePerRoom;
        additionalCost += bedroomsPrice;
        breakdown.push({ item: `${values.bedrooms} Bedroom${values.bedrooms > 1 ? 's' : ''}`, price: bedroomsPrice });
      }
      
      if (values.bathrooms > 0) {
        const bathroomsPrice = values.bathrooms * extraPricePerRoom;
        additionalCost += bathroomsPrice;
        breakdown.push({ item: `${values.bathrooms} Bathroom${values.bathrooms > 1 ? 's' : ''}`, price: bathroomsPrice });
      }
      
      if (values.livingRooms > 0) {
        const livingRoomsPrice = values.livingRooms * extraPricePerRoom;
        additionalCost += livingRoomsPrice;
        breakdown.push({ item: `${values.livingRooms} Living Room${values.livingRooms > 1 ? 's' : ''}`, price: livingRoomsPrice });
      }
      
      if (values.garages > 0) {
        const garagesPrice = values.garages * extraPricePerRoom;
        additionalCost += garagesPrice;
        breakdown.push({ item: `${values.garages} Garage${values.garages > 1 ? 's' : ''}`, price: garagesPrice });
      }
      
      if (values.den) {
        const denPrice = extraPricePerRoom;
        additionalCost += denPrice;
        breakdown.push({ item: "Den", price: denPrice });
      }
      
      const subtotal = servicePrice + additionalCost;
      
      // Apply discount if full payment option selected
      let finalTotal = subtotal;
      if (values.paymentOption === "full") {
        const discount = subtotal * 0.05; // 5% discount
        finalTotal = subtotal - discount;
        breakdown.push({ item: "5% Discount (Pay in Full)", price: -discount });
      }
      
      setTotalPrice(finalTotal);
      setPriceBreakdown(breakdown);
      
      // Set payment amount based on selected option
      if (values.paymentOption === "deposit") {
        setFinalPaymentAmount(250); // Fixed deposit amount
      } else {
        setFinalPaymentAmount(finalTotal); // Full amount with discount
      }
    };
    
    calculatePrice();
    
    // Subscribe to form value changes
    const subscription = form.watch(() => {
      calculatePrice();
    });
    
    return () => subscription.unsubscribe();
  }, [form, services]);

  // File upload validation and handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const errors: string[] = [];
      
      const validFiles = newFiles.filter(file => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          errors.push(`"${file.name}" is not a valid image format. Please use JPG, PNG, or WebP.`);
          return false;
        }
        
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`"${file.name}" exceeds the maximum size of 5MB.`);
          return false;
        }
        
        return true;
      });
      
      // Limit total files to 10
      if (files.length + validFiles.length <= 10) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        errors.push("Maximum 10 images allowed");
      }
      
      setFileErrors(errors);
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }
    }
  };
  
  // Remove file from the list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form submit handler
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

      // Prepare property details
      const propertyDetails = {
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        livingRooms: data.livingRooms,
        garages: data.garages,
        den: data.den,
      };

      // Determine payment status
      const paymentAmount = data.paymentOption === "full" ? totalPrice : 250;
      const paymentStatus = "unpaid"; // Will be updated after payment processing

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
            payment_status: paymentStatus,
            payment_option: data.paymentOption,
            total_amount: totalPrice,
            payment_amount: paymentAmount,
            property_details: propertyDetails,
            price_breakdown: priceBreakdown,
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

          <h3 className="text-lg font-semibold mb-4 mt-8">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Bedrooms</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BedDouble className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        type="number" 
                        min={0} 
                        max={10} 
                        {...field} 
                        placeholder="0" 
                        className="pl-10 h-12" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Bathrooms</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Bath className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        type="number" 
                        min={0} 
                        max={10} 
                        {...field} 
                        placeholder="0" 
                        className="pl-10 h-12" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="livingRooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Living Rooms</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Sofa className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        type="number" 
                        min={0} 
                        max={5} 
                        {...field} 
                        placeholder="0" 
                        className="pl-10 h-12" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="garages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Garages</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CarFront className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input 
                        type="number" 
                        min={0} 
                        max={3} 
                        {...field} 
                        placeholder="0" 
                        className="pl-10 h-12" 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="den"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Includes Den
                  </FormLabel>
                  <FormDescription>
                    Check this if your property has a den or office space
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <h3 className="text-lg font-semibold mb-4 mt-8">Service Date</h3>
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
          
          <h3 className="text-lg font-semibold mb-4 mt-8">Property Photos (Optional)</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
              <p className="text-sm text-gray-600 mb-2">Drag/Drop to Upload Media</p>
              <div className="flex flex-col space-y-2 text-xs text-gray-500 mb-4">
                <p>Maximum 10 images</p>
                <p>Accepted formats: JPG, PNG, WebP</p>
                <p>Maximum file size: 5MB per image</p>
              </div>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                multiple 
                accept="image/jpeg,image/png,image/jpg,image/webp" 
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm"
              >
                Select Files
              </label>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2 text-left">Selected Files:</h4>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FileX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {fileErrors.length > 0 && (
                <div className="mt-4 text-left">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">File upload issues:</h4>
                        <ul className="list-disc pl-5 mt-1 text-xs text-red-700 space-y-1">
                          {fileErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
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

          {/* Real-time cost estimation */}
          <Card className="mt-8 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calculator className="h-5 w-5 mr-2" />
                Cost Estimate
              </CardTitle>
              <CardDescription>
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Prices are subject to change after admin reviews uploaded images.
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {priceBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.item}</span>
                    <span className={item.price < 0 ? "text-green-600 font-medium" : ""}>
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment options */}
          <FormField
            control={form.control}
            name="paymentOption"
            render={({ field }) => (
              <FormItem className="mt-8">
                <FormLabel>Payment Option</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className={`flex flex-col border rounded-lg p-4 ${field.value === "full" ? "bg-green-50 border-green-200" : ""}`}>
                      <RadioGroupItem value="full" id="option-full" className="sr-only" />
                      <Label
                        htmlFor="option-full"
                        className="flex cursor-pointer flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Pay in Full (5% Discount)</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Pay the entire amount now and receive a 5% discount.
                        </div>
                        <div className="font-medium text-green-600 mt-2">
                          You pay: {formatCurrency(field.value === "full" ? finalPaymentAmount : totalPrice * 0.95)}
                        </div>
                      </Label>
                    </div>

                    <div className={`flex flex-col border rounded-lg p-4 ${field.value === "deposit" ? "bg-blue-50 border-blue-200" : ""}`}>
                      <RadioGroupItem value="deposit" id="option-deposit" className="sr-only" />
                      <Label
                        htmlFor="option-deposit"
                        className="flex cursor-pointer flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Pay Deposit Only</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Pay a fixed deposit of $250 CAD now, and the remaining balance after service.
                        </div>
                        <div className="font-medium text-blue-600 mt-2">
                          You pay now: {formatCurrency(250)}
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
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
              "PROCEED TO PAYMENT"
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
              Select a payment method to complete your booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Due</span>
                <span className="text-xl font-bold">{formatCurrency(finalPaymentAmount)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {form.getValues("paymentOption") === "deposit" 
                  ? `Deposit only (remaining balance of ${formatCurrency(totalPrice - 250)} due after service)` 
                  : "Full payment with 5% discount applied"}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Select Payment Method</h3>
              <RadioGroup 
                defaultValue="bank" 
                onValueChange={setPaymentMethod}
                className="space-y-2"
              >
                <div className={`flex items-center space-x-2 border rounded-md p-3 ${paymentMethod === "bank" ? "bg-blue-50 border-blue-200" : ""}`}>
                  <RadioGroupItem value="bank" id="method-bank" />
                  <Label htmlFor="method-bank" className="flex-1 cursor-pointer">
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-xs text-gray-500">Transfer funds directly to our account</div>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-2 border rounded-md p-3 ${paymentMethod === "credit" ? "bg-blue-50 border-blue-200" : ""}`}>
                  <RadioGroupItem value="credit" id="method-credit" />
                  <Label htmlFor="method-credit" className="flex-1 cursor-pointer">
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-xs text-gray-500">Pay securely with your card</div>
                  </Label>
                </div>
                
                <div className={`flex items-center space-x-2 border rounded-md p-3 ${paymentMethod === "paypal" ? "bg-blue-50 border-blue-200" : ""}`}>
                  <RadioGroupItem value="paypal" id="method-paypal" />
                  <Label htmlFor="method-paypal" className="flex-1 cursor-pointer">
                    <div className="font-medium">PayPal</div>
                    <div className="text-xs text-gray-500">Pay using your PayPal account</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "bank" && (
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
            )}

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
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>

            {paymentMethod === "bank" ? (
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
            ) : (
              <Button
                onClick={() => {
                  // Simulate payment processing
                  setIsFormSubmitting(true);
                  setTimeout(() => {
                    setIsFormSubmitting(false);
                    setIsPaymentModalOpen(false);
                    toast.success("Payment successful! Your booking is confirmed.");
                    router.push("/dashboard/booking-history");
                  }, 2000);
                }}
                className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </Button>
            )}
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