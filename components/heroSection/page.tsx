import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Star } from "lucide-react";

function Hero() {
  return (
    <div className="container mx-auto px-4 md:px-6 mt-24">
      <section className="bg-green-100 py-20 relative rounded-xl mt-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-8 pl-16">
            <div className="flex items-center gap-4">
              <Image
                src="/assets/hero/icon.png"
                alt="Spotless Transitions Logo"
                width={60}
                height={60}
              />
              <div>
                <div className="text-sm font-medium text-gray-600">
                  CLEANING SERVICES TAILORED TO YOUR NEEDS
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  <span className="text-green-500">SPOTLESS</span> TRANSITIONS
                </h1>
              </div>
            </div>

            <p className="text-xl font-medium text-gray-700">
              MOVE-IN & MOVE-OUT CLEANING + REPAIRS
              <br />
              ACROSS MULTIPLE LOCATIONS!
            </p>

            <div className="flex flex-row gap-6">
              <div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div className="bg-green-500 h-5 w-5 rounded-sm flex items-center">
                      <Star
                        key={star}
                        className="h-3 w-3 fill-orange-300 text-orange-300 mx-auto"
                      />
                    </div>
                  ))}
                  <span className="font-bold ml-2 text-lg">EXCELLENT</span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">
                    BASED ON
                    <span className="text-green-500 px-1">20K</span>
                    CLIENTS REVIEWS
                  </span>
                </div>
              </div>
              <Button
                asChild
                className="bg-green-400 hover:bg-green-500 text-white text-sm px-6 py-6"
              >
                <Link href="/booking">BOOK A CLEANING</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="absolute right-0 top-0 z-0">
              <Image
                src="/assets/hero/Shape.png"
                alt="Background shape"
                width={300}
                height={300}
                className="w-auto object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-16 z-10 h-full">
              <Image
                src="/assets/hero/people.png"
                alt="Cleaning professionals"
                width={600}
                height={600}
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
