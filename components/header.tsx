"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { clientNavigation } from "./dashboard/clientDummyData";
import { getAdminNavigation } from "@/constants/admin-navigation";

export default function Header() {
  const { logout, user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/#services", label: "SERVICES" },
    { href: "/#contact-us", label: "OUR LOCATIONS" },
    { href: "/#contact-us", label: "CONTACT US" },
    { href: "/faq", label: "F.A.Qs" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };

  // Determine which navigation items to show based on path and user status
  const getNavigationItems = () => {
    if (pathname.startsWith("/admin")) {
      return getAdminNavigation();
    } else if (pathname.startsWith("/dashboard")) {
      return clientNavigation;
    }
    return null;
  };

  const navItems = getNavigationItems();

  const isAdminPage = pathname.startsWith("/admin");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isMainPage = !isAdminPage && !isDashboardPage;

  return (
    <header
      className={`bg-white border-b fixed top-0 left-0 right-0 z-20 w-full transition-all duration-300 ${
        scrolled ? "shadow-md py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-20">
            <Image
              src="/logo.svg"
              alt="Spotless Transitions Logo"
              width={180}
              height={40}
              priority
              className="w-auto h-8 md:h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {!user ? (
              navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="font-medium hover:text-green-500 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                {user && !isDashboardPage && (
                  <Link
                    href="/dashboard"
                    className="font-medium text-lg hover:text-green-500 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                )}
                {isAdmin && !isAdminPage && (
                  <Link
                    href="/admin"
                    className="font-medium text-lg hover:text-green-500 transition-colors duration-200"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side buttons/dropdown */}
          <div className="flex items-center gap-2 md:gap-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAdmin && (
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white hidden sm:flex"
              >
                <Link href="/booking">BOOK A CLEANING</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-3/4 sm:w-2/5 bg-white z-10 pt-20 px-6 flex flex-col border-l shadow-lg transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } lg:hidden`}
          >
            <nav className="flex flex-col gap-6 items-start">
              {!user ? (
                navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="font-medium text-lg hover:text-green-500 transition-colors duration-200"
                    onClick={handleNavLinkClick}
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                <>
                  {navItems &&
                    navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                          pathname === item.href
                            ? "text-green-500"
                            : "text-gray-700 hover:text-green-500"
                        )}
                        onClick={handleNavLinkClick}
                      >
                        <item.icon className="h-5 w-5 text-green-500" />
                        {item.name}
                      </Link>
                    ))}
                </>
              )}

              {/* Navigation buttons for mobile */}
              {user && !isDashboardPage && (
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white mt-6 w-full"
                >
                  <Link href="/dashboard" onClick={handleNavLinkClick}>
                    DASHBOARD
                  </Link>
                </Button>
              )}

              {isAdmin && !isAdminPage && (
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white mt-6 w-full"
                >
                  <Link href="/admin" onClick={handleNavLinkClick}>
                    ADMIN DASHBOARD
                  </Link>
                </Button>
              )}

              {!isAdmin && (
                <Button
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white mt-6 w-full"
                >
                  <Link href="/booking" onClick={handleNavLinkClick}>
                    BOOK A CLEANING
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
