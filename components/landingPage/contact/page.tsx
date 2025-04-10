"use client"

import React, { useState } from 'react';
import { Mail, MapPin, Pen, Phone } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';


// Define validation schema with Zod
const contactSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9\s()-]{8,}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

const offices = [
  { name: "Offices #01", phone: "00962785447043" },
  { name: "Offices #02", phone: "00962785447043" },
  { name: "Offices #03", phone: "00962785447043" },
  { name: "Offices #04", phone: "00962785447043" },
];

const emails = [
  { name: "E-Mail #1", address: "dt@ibtecar.me" },
  { name: "E-Mail #2", address: "dt@ibtecar.me" },
];

function ContactSection() {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const {user } = useAuth()
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  

  // Form validation using Zod
  const validateForm = (): boolean => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors: Record<string, string> = {}; // Ensure correct type
  
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
      }
  
      setErrors(formattedErrors);
      return false;
    }
  };
  
  // Form submission with Supabase
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form using Zod
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a timestamp for the submission
      const submittedAt = new Date().toISOString();
      
      // Insert data into Supabase 'contact_messages' table
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          { 
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject,
            message: formData.message,
            user_id: user.id
          }
        ]);
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Clear form after successful submission
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again later.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-24 bg-white" id='contact-us'>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Left: Form */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">SEND A MESSAGE</h2>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
              Whether you have questions about our services, want to discuss a custom
              project, or are ready to take the next step in your Design Thinking journey.
            </p>
            
            {/* Success message */}
            {submitSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4" role="alert">
                Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {/* Error message */}
            {submitError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4" role="alert">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className={`flex items-center gap-2 bg-gray-100 p-3 rounded-md ${errors.fullName ? 'border border-red-500' : ''}`}>
                    <div className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name" 
                      className="bg-transparent w-full outline-none text-sm" 
                      aria-label="Full Name"
                      aria-required="true"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    />
                  </div>
                  {errors.fullName && (
                    <p id="fullName-error" className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <div className={`flex items-center gap-2 bg-gray-100 p-3 rounded-md ${errors.email ? 'border border-red-500' : ''}`}>
                    <div className="text-gray-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="E-Mail Address" 
                      className="bg-transparent w-full outline-none text-sm" 
                      aria-label="Email Address"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className={`flex items-center gap-2 bg-gray-100 p-3 rounded-md ${errors.phone ? 'border border-red-500' : ''}`}>
                    <div className="text-gray-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number" 
                      className="bg-transparent w-full outline-none text-sm" 
                      aria-label="Phone Number"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <div className={`flex items-center gap-2 bg-gray-100 p-3 rounded-md ${errors.subject ? 'border border-red-500' : ''}`}>
                    <div className="text-gray-500">
                      <Pen className="h-5 w-5" />
                    </div>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject" 
                      className="bg-transparent w-full outline-none text-sm" 
                      aria-label="Subject"
                      aria-required="true"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                    />
                  </div>
                  {errors.subject && (
                    <p id="subject-error" className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className={`flex items-start gap-2 bg-gray-100 p-3 rounded-md ${errors.message ? 'border border-red-500' : ''}`}>
                  <div className="text-gray-500 pt-1">
                    <Pen className="h-5 w-5" />
                  </div>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message" 
                    className="bg-transparent w-full outline-none min-h-24 sm:min-h-32 resize-none text-sm" 
                    rows={4}
                    aria-label="Message"
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  ></textarea>
                </div>
                {errors.message && (
                  <p id="message-error" className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="bg-green-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-md font-medium w-auto inline-block text-sm sm:text-base disabled:opacity-70"
                disabled={isSubmitting}
                aria-label="Send Message"
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

          {/* Right: Contact Info */}
          <div className="bg-gray-100 p-4 sm:p-6 rounded-lg mt-6 lg:mt-0">
            {/* Address */}
            <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Visit US in</h3>
                <address className="text-gray-700 text-xs sm:text-sm not-italic">
                  305 Wasfi Al-Tal, 2nd Floor, Office 4, Khalda, Amman, Jordan
                </address>
              </div>
            </div>

            {/* Offices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {offices.map((office, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">{office.name}</div>
                    <a href={`tel:${office.phone}`} className="text-gray-700 text-xs sm:text-sm hover:underline">
                      {office.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Emails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {emails.map((email, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">{email.name}</div>
                    <a href={`mailto:${email.address}`} className="text-gray-700 text-xs sm:text-sm break-words hover:underline">
                      {email.address}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;