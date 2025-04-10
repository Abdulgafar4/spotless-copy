import Image from "next/image";
import React from "react";
import { Button } from "../../ui/button";
import Link from "next/link";

function CTABanner() {
  return (
    <div className="container mx-auto px-4 md:px-6 mt-24 ">
      <section className="bg-green-100 py-28 relative rounded-xl mt-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-8 pl-16">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold ">
                <span className="text-green-500">HIGH-QUALITY</span> CLEANING AND
                </h1>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  REPAIR SERVICES
                </h1>
              </div>
            </div>

            <p className="text-xl font-medium ">
              MOVE-IN & MOVE-OUT CLEANING + REPAIRS
              <br />
              ACROSS MULTIPLE LOCATIONS!
            </p>

            <div className="flex flex-row gap-6">
              <Button
                asChild
                className="bg-green-600 hover:bg-green-500 text-white text-sm px-6 py-6"
              >
                <Link href="/booking">BOOK A CLEANING NOW</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="absolute right-0 top-0 z-0">
              <Image
                src="/assets/hero/Shape-1.png"
                alt="Background shape"
                width={300}
                height={300}
                className="w-auto object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-32 z-10 h-full">
              <Image
                src="/assets/hero/wemen.png"
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

export default CTABanner;
