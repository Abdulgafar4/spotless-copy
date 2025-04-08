import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

// Reusable StatCard component
const StatCard = ({ value, label, className = '' }: { value: string, label: string, className?: string }) => (
  <div className={`space-y-2 bg-gray-100 py-6 pl-4 rounded-lg ${className}`}>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-lg text-gray-500 font-bold">{label}</div>
  </div>
)

function WhyUs() {
  return (
<section className="py-8 sm:py-12 md:py-16 mt-6 sm:mt-10">
  <div className="container mx-auto px-4 md:px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
      <div className="space-y-4 sm:space-y-6">
        <div className='space-y-2 sm:space-y-4'>
          <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-600">WHY US</h3>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-green-500">
            WHY CHOOSE SPOTLESS TRANSITION
          </h2>
        </div>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">
          To provide seamless and stress-free move-out and pre-sale
          cleaning services that ensure properties are handed over in
          perfect condition, maximizing value and satisfaction for
          tenants, homeowners, and realtors.
        </p>
        <Button
          asChild
          className="bg-green-600 hover:bg-green-500 text-white rounded-3xl py-3 sm:py-4 md:py-6 px-4 sm:px-6 text-xs sm:text-sm md:text-base"
        >
          <Link href="/booking" className="flex items-center">
            BOOK A CLEANING NOW <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-8">
          <StatCard value="7000+" label="HAPPY CLIENT" />
          <StatCard value="80+" label="OFFICES" />
          <StatCard value="40+" label="CANADIAN CITY" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 h-full px-4 sm:px-8 md:px-16 mt-6 lg:mt-0">
        <div className="col-span-2">
          <Image
            src="/assets/whyus/image-1.png"
            alt="Cleaning service"
            width={500}
            height={300}
            className="rounded-lg w-full h-48 sm:h-64 md:h-[280px] object-cover"
          />
        </div>
        <div className="col-span-1">
          <Image
            src="/assets/whyus/image-2.png"
            alt="Cleaning service"
            width={300}
            height={200}
            className="rounded-lg w-full h-32 sm:h-40 md:h-[180px] lg:h-[200px] object-cover"
          />
        </div>
        <div className="col-span-1">
          <Image
            src="/assets/whyus/image-3.png"
            alt="Cleaning service"
            width={300}
            height={200}
            className="rounded-lg w-full h-32 sm:h-40 md:h-[180px] lg:h-[200px] object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</section>
  )
}

export default WhyUs