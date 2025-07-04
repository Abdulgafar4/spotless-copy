import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Facebook, Instagram, Linkedin, X, ArrowRight, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-green-50 to-green-100 pt-24 pb-8 mt-40">
      {/* Wave SVG at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ transform: 'translateY(-99%)' }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 120" 
          fill="url(#gradient)"
          preserveAspectRatio="none"
          className="w-full h-24"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/domu-logo.png"
                alt="Domu Clean Logo"
                width={180}
                height={40}
                priority
                className="mb-4"
              />
              <div className="w-20 h-1 bg-green-500 mb-6"></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              We specialize in helping renters, homeowners, and realtors
              prepare properties for smooth transitions. We provide top-tier
              cleaning, repairs, painting, and general maintenance services to
              ensure homes are in pristine condition for move-outs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Quick Links"
              links={[
                { label: "Home", href: "/" },
                { label: "Services", href: "#services" },
                { label: "Why Choose Us", href: "#why-us" },
                { label: "About Us", href: "#about-us" },
              ]}
            />
          </div>

          {/* Important Links */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Important Links"
              links={[
                { label: "FAQs", href: "/faq" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms & Conditions", href: "#" },
              ]}
            />
          </div>

          {/* Newsletter & Social */}
          <div className="lg:col-span-1">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Stay Updated</h3>
            <p className="text-sm text-gray-600 mb-4">Subscribe to receive the latest news and updates</p>
            <div className="flex items-center bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-grow px-4 py-3 text-sm outline-none"
              />
              <button className="bg-green-500 hover:bg-green-600 transition-colors text-white p-3">
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8">
              <h4 className="font-bold text-gray-800 mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                <SocialIcon href="#" icon={<Instagram className="h-5 w-5" />} label="Instagram" />
                <SocialIcon href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
                <SocialIcon href="#" icon={<X className="h-5 w-5" />} label="Twitter" />
                <SocialIcon href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 pt-6 border-t border-green-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Domu Clean - All rights reserved</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#services" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
              SERVICES
            </Link>
            <Link href="#why-us" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
              WHY US
            </Link>
            <Link href="#about-us" className="text-sm text-gray-500 hover:text-green-600 transition-colors">
              ABOUT US
            </Link>
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
  links: { label: string; href: string }[];
}) => (
  <div>
    <h3 className="text-gray-800 font-bold text-lg mb-6">{title}</h3>
    <ul className="space-y-3">
      {links.map((link, idx) => (
        <li key={idx} className="text-gray-600 hover:text-green-600 transition-colors">
          <Link href={link.href} className="flex items-center group">
            <span className="text-green-500 mr-2 transform transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </span>
            <span className="text-sm">{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ 
  icon, 
  href,
  label 
}: { 
  icon: React.ReactNode;
  href: string;
  label: string;
}) => (
  <Link href={href} aria-label={label}>
    <div className="bg-white text-green-500 hover:bg-green-500 hover:text-white p-2 rounded-lg shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-100">
      {icon}
    </div>
  </Link>
);

export default Footer;