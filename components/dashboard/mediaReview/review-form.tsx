"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock, Star, Upload, X, ImagePlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
  staff_assigned?: string[];
}

interface ReviewFormProps {
  appointments: Appointment[];
  onSubmit: (
    appointmentId: string, 
    staffName: string, 
    rating: number, 
    comment: string, 
    images?: string[]
  ) => Promise<boolean>;
}

const reviewFormSchema = z.object({
  appointmentId: z.string({
    required_error: "Please select an appointment",
  }),
  staffName: z.string({
    required_error: "Please select a staff member",
  }),
  rating: z.number({
    required_error: "Please select a rating",
  }).min(1, { message: "Rating must be at least 1 star" }).max(5),
  comment: z.string()
    .min(10, { message: "Comment must be at least 10 characters" })
    .max(500, { message: "Comment must not exceed 500 characters" }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewForm({ appointments, onSubmit }: ReviewFormProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      appointmentId: "",
      staffName: "",
      rating: 0,
      comment: "",
    },
  });

  const handleFormSubmit = async (values: ReviewFormValues) => {
    setSubmitting(true);
    try {
      const success = await onSubmit(
        values.appointmentId, 
        values.staffName, 
        values.rating, 
        values.comment,
        images.length > 0 ? images : undefined
      );
      
      if (success) {
        // Reset form on success
        form.reset();
        setSelectedAppointment(null);
        setRating(0);
        setImages([]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const selected = appointments.find(apt => apt.id === appointmentId) || null;
    setSelectedAppointment(selected);
    form.setValue("staffName", ""); // Reset staff selection
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    form.setValue("rating", newRating);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > 3) {
      toast.error("You can upload a maximum of 3 images");
      return;
    }
    
    // In a real implementation, you would upload these to storage
    // Here we'll just create URLs for demonstration
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="appointmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Appointment</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleAppointmentChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a completed appointment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.service_type} - {formatDate(appointment.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedAppointment && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Appointment Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  <span>{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{selectedAppointment.time}</span>
                </div>
                {selectedAppointment.staff_assigned && selectedAppointment.staff_assigned.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-blue-600 font-medium">Staff who provided service:</p>
                    <ul className="mt-1 space-y-1">
                      {selectedAppointment.staff_assigned.map((staff, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-blue-500" />
                          <span>{staff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedAppointment && selectedAppointment.staff_assigned && (
          <FormField
            control={form.control}
            name="staffName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Staff Member to Review</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a staff member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedAppointment?.staff_assigned?.map((staff, index) => (
                      <SelectItem key={index} value={staff}>
                        {staff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => handleRatingChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                Click on the stars to rate your experience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share your experience with our service"
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your feedback helps us improve our services
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Upload Images (Optional)</FormLabel>
          <div className="mt-2">
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                  <img src={image} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  type="button"
                  className="w-20 h-20 flex flex-col items-center justify-center bg-gray-100 rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    multiple={images.length < 2}
                  />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Maximum 3 images. Supported formats: JPG, PNG.
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}