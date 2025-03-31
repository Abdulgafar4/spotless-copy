import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Facebook, Instagram, Linkedin, X } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-green-50 pt-20 pb-6 mt-20">
      {/* Wave SVG at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ transform: 'translateY(-99%)' }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 120" 
          fill="#f0fdf4" // Green-50 color
          preserveAspectRatio="none"
          className="w-full h-20"
        >
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/logo.png"
                alt="Spotless Transitions Logo"
                width={180}
                height={40}
                priority
              />
            </div>
            <p className="text-sm text-gray-600">
              We specialize in helping renters, homeowners, and realtors
              prepare properties for smooth transitions. We provide top-tier
              cleaning, repairs, painting, and general maintenance services to
              ensure homes are in pristine condition for move-outs.
            </p>
          </div>

          {/* Explore */}
          <FooterColumn
            title="Explore"
            links={[
              "Link Example #1",
              "Link Example #2",
              "Link Example #3",
              "Link Example #4",
            ]}
          />

          {/* Quick Links */}
          <FooterColumn
            title="Quick Links"
            links={["About US", "Contact Us", "Our Prices", "Blog Articles"]}
          />

          {/* Important Links */}
          <FooterColumn
            title="Important Links"
            links={["FAQs", "Privacy Policy", "Terms & Conditions", "Sitemap"]}
          />

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold mb-4">Keep Yourself Up To Date</h3>
            <div className="flex items-center bg-white rounded-md overflow-hidden border border-gray-300">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-grow px-4 py-2 text-sm outline-none"
              />
              <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-r-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <SocialIcon icon={<Instagram />} />
                <SocialIcon icon={<Linkedin />} />
                <SocialIcon icon={<X />} />
                <SocialIcon icon={<Facebook />} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-6 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center">
          <p>© Company Name - All rights reserved</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#services" className="hover:text-green-500">SERVICES</Link>
            <Link href="#" className="hover:text-green-500">OUR FACILITIES</Link>
            <Link href="#" className="hover:text-green-500">GALLERY</Link>
            <Link href="#contact-us" className="hover:text-green-500">CONTACT US</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: string[];
}) => (
  <div>
    <h3 className="font-semibold mb-4">{title}</h3>
    <ul className="space-y-2 text-sm text-gray-600">
      {links.map((label, idx) => (
        <li key={idx}>
          <Link href="#" className="hover:text-green-500">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className="text-green-500 hover:bg-green-500 hover:text-white p-2 rounded-full cursor-pointer transition-colors duration-200">
    {icon}
  </div>
);

export default Footer;