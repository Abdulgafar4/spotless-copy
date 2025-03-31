"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';


export default function Header() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "#services", label: "SERVICES" },
    { href: "#our-facilities", label: "OUR FACILITIES" },
    { href: "#gallery", label: "GALLERY" },
    { href: "#contact-us", label: "CONTACT US" },
  ];
  return (
    <header className="bg-white py-4 border-b fixed top-0 left-0 right-0 z-20 mb-40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logo.png"
              alt="Spotless Transitions Logo"
              width={180}
              height={40}
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!user ? navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="font-medium hover:text-green-500"
              >
                {link.label}
              </Link>
            )) : 
            <Link
            href={'/dashboard'}
            className="font-medium hover:text-green-500"
          >
            Dashboard
          </Link>
            }
          </nav>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={logout}>
                      Logout
                    </DropdownMenuItem>
                  </>
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

            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Link href="/booking">BOOK A CLEANING</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
