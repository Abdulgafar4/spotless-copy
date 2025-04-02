import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Star } from "lucide-react";

function Hero() {
  return (
    <div className="container mx-auto px-4 md:px-6 mt-24">
      <section className="bg-green-100 py-10 md:py-20 relative rounded-xl mt-6 md:mt-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-6 md:space-y-8 px-4 md:px-8 lg:pl-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src="/assets/hero/icon.png"
                alt="Spotless Transitions Logo"
                width={60}
                height={60}
              />
              <div>
                <div className="text-xs sm:text-sm font-medium text-gray-600 mt-2 sm:mt-0">
                  CLEANING SERVICES TAILORED TO YOUR NEEDS
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <span className="text-green-500">SPOTLESS</span> TRANSITIONS
                </h1>
              </div>
            </div>

            <p className="text-lg md:text-xl font-medium text-gray-700">
              MOVE-IN & MOVE-OUT CLEANING + REPAIRS
              <br className="hidden sm:block" />
              ACROSS MULTIPLE LOCATIONS!
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="bg-green-500 h-4 w-4 sm:h-5 sm:w-5 rounded-sm flex items-center">
                      <Star
                        className="h-2 w-2 sm:h-3 sm:w-3 fill-orange-300 text-orange-300 mx-auto"
                      />
                    </div>
                  ))}
                  <span className="font-bold ml-2 text-base sm:text-lg">EXCELLENT</span>
                </div>

                <div className="text-xs sm:text-sm mt-1">
                  <span className="text-gray-600">
                    BASED ON
                    <span className="text-green-500 px-1">20K</span>
                    CLIENTS REVIEWS
                  </span>
                </div>
              </div>
              <Button
                asChild
                className="bg-green-400 hover:bg-green-500 text-white text-sm px-4 py-5 sm:px-6 sm:py-6 self-start mt-2 sm:mt-0"
              >
                <Link href="/booking">BOOK A CLEANING</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative h-full">
            <div className="absolute right-0 top-0 z-0">
              <Image
                src="/assets/hero/Shape.png"
                alt="Background shape"
                width={300}
                height={300}
                className="w-auto object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-0 z-10 h-full">
              <Image
                src="/assets/hero/people.png"
                alt="Cleaning professionals"
                width={500}
                height={500}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Hero;