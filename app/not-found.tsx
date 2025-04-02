"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import { useAuth } from '@/hooks/use-auth';

export default function NotFound() {
    const {  user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Page Not Found</h2>

        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to{" "}
          {user ? "your dashboard" : "home"}.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
            <Link href={user ? "/dashboard" : "/"}>
              {user ? (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
                </>
              ) : (
                <>
                  <Home className="mr-2 h-4 w-4" /> Back to Home
                </>
              )}
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/#contact-us">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

