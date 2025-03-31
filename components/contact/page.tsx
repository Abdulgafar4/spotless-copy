import React from 'react';
import ContactForm from "@/components/contact-form";
import { Mail, MapPin, Pen, Phone } from 'lucide-react';

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
  return (
<section className="py-8 sm:py-12 md:py-16 bg-white" id='contact-us'>
  <div className="container mx-auto px-4 md:px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
      {/* Left: Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">SEND A MESSAGE</h2>
        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-4 sm:mb-6">
          Whether you have questions about our services, want to discuss a custom
          project, or are ready to take the next step in your Design Thinking journey.
        </p>
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-md">
              <div className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input type="text" placeholder="Full Name" className="bg-transparent w-full outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-md">
              <div className="text-gray-500">
                <Mail className="h-5 w-5" />
              </div>
              <input type="email" placeholder="E-Mail Address" className="bg-transparent w-full outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-md">
              <div className="text-gray-500">
                <Phone className="h-5 w-5" />
              </div>
              <input type="tel" placeholder="Phone Number" className="bg-transparent w-full outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-md">
              <div className="text-gray-500">
                <Pen className="h-5 w-5" />
              </div>
              <input type="text" placeholder="Subject" className="bg-transparent w-full outline-none text-sm" />
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-100 p-3 rounded-md">
            <div className="text-gray-500 pt-1">
              <Pen className="h-5 w-5" />
            </div>
            <textarea placeholder="Your message" className="bg-transparent w-full outline-none min-h-24 sm:min-h-32 resize-none text-sm" rows={4}></textarea>
          </div>

          <button className="bg-green-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-md font-medium w-auto inline-block text-sm sm:text-base">
            SEND MESSAGE
          </button>
        </div>
      </div>

      {/* Right: Contact Info */}
      <div className="bg-gray-100 p-4 sm:p-6 rounded-lg mt-6 lg:mt-0">
        {/* Address */}
        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">Visit US in</h3>
            <p className="text-gray-700 text-xs sm:text-sm">
              305 Wasfi Al-Tal, 2nd Floor, Office 4, Khalda, Amman, Jordan
            </p>
          </div>
        </div>

        {/* Offices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {offices.map((office, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4">
              <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg">{office.name}</div>
                <div className="text-gray-700 text-xs sm:text-sm">{office.phone}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Emails */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {emails.map((email, index) => (
            <div key={index} className="flex items-start gap-3 sm:gap-4">
              <div className="bg-green-500 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg">{email.name}</div>
                <div className="text-gray-700 text-xs sm:text-sm break-words">{email.address}</div>
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