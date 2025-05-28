"use client"

import React, { useState } from 'react';
import { Mail, MapPin, Pen, Phone, Send, User } from 'lucide-react';
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

function ContactSection() {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const { user } = useAuth();

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
  const validateForm = () => {
    try {
      contactSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors: Record<string, string> = {};

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

  // Send admin notification with enhanced debugging
  const sendAdminNotification = async (contactData: any) => {
    try {

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          subject: contactData.subject,
          message: contactData.message,
          admin_email: 'etzteemmytee0@gmail.com'
        })
      });


      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      // Don't fail the whole process if admin notification fails
      return null;
    }
  };

  // Form submission with enhanced debugging
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

    await sendAdminNotification({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    });


    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject,
            message: formData.message,
            user_id: user?.id
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
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-gray-50" id="contact-us">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Get In Touch</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether you have questions about our services, want to discuss a custom
            project, or are ready to take the next step in your Design Thinking journey,
            we'd love to hear from you.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success message */}
          {submitSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-4 flex items-start" role="alert">
              <div className="bg-green-100 rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-700 text-lg mb-1">Message Sent!</h3>
                <p className="text-green-600">Thank you for reaching out. We'll get back to you as soon as possible.</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-4 flex items-start" role="alert">
              <div className="bg-red-100 rounded-full p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-red-700 text-lg mb-1">Oops!</h3>
                <p className="text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="fullName">Full Name</label>
                <div className={`relative rounded-lg border ${errors.fullName ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'} overflow-hidden transition-all`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Your name"
                    aria-required="true"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                </div>
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="email">Email Address</label>
                <div className={`relative rounded-lg border ${errors.email ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'} overflow-hidden transition-all`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="your.email@example.com"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="phone">Phone Number <span className="text-gray-400">(Optional)</span></label>
                <div className={`relative rounded-lg border ${errors.phone ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'} overflow-hidden transition-all`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="+1 (123) 456-7890"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="subject">Subject</label>
                <div className={`relative rounded-lg border ${errors.subject ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'} overflow-hidden transition-all`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Pen className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="What is this regarding?"
                    aria-required="true"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                  />
                </div>
                {errors.subject && (
                  <p id="subject-error" className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="message">Your Message</label>
              <div className={`relative rounded-lg border ${errors.message ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'} overflow-hidden transition-all`}>
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <Pen className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="block w-full pl-10 pr-3 py-3 border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Please provide details about your inquiry..."
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                ></textarea>
              </div>
              {errors.message && (
                <p id="message-error" className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                aria-label="Send Message"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;