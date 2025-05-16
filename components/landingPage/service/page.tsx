"use client";

import React, { useEffect, useState } from "react";
import ServiceCard from "./ServiceCard";
import { Button } from "../../ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAdminServices } from "@/hooks/use-service";
import { useAdminBranches } from "@/hooks/use-branch";


const serviceMapping: Record<string, string> = {
  "Move-Out Cleaning": "move-out-cleaning",
  "Move-In Cleaning": "move-in-cleaning",
  "Repairs & Maintenance": "repairs-maintenance",
  "Painting & Touch-Ups": "painting-touchups",
  "Carpet & Floor Cleaning": "carpet-floor-cleaning",
  "Junk Removal": "junk-removal",
  "Window Cleaning": "window-cleaning",
  "Pre-Sale Home Assistance": "pre-sale-home",
};

function Service() {
  const { services, loading: servicesLoading } = useAdminServices();
  const { branches, loading: branchesLoading } = useAdminBranches();
  const [displayedServices, setDisplayedServices] = useState<any[]>([]);

  useEffect(() => {
    if (services && services.length > 0) {
      // Map Supabase services to match our ServiceCard structure
      const mappedServices = services.map(service => ({
        id: service.id,
        title: service.name,
        description: service.description,
        image: service.imageUrl || "/placeholder.svg",
        value: serviceMapping[service.name] || service.id, // Use mapping or fallback to id
        price: service.price,
        service_code: serviceMapping[service.name] || service.id
      }));
      setDisplayedServices(mappedServices); // Show only 7 services
    }
  }, [services]);

  if (servicesLoading || branchesLoading) {
    return (
      <section className="py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </section>
    );
  }

  return (
    <section className="pt-24" id="services">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-sm md:text-xl font-light tracking-wider mb-2">SOME OF OUR FEATURES</h2>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl md:text-3xl font-extrabold">SERVICES FOR YOU</h3>
              <span className="text-green-500 text-2xl md:text-3xl font-extrabold">COMFORT.</span>
            </div>
          </div>

          <div>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 flex items-center"
              asChild
            >
              <Link href="/services">
                EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedServices.map((service) => (
            <ServiceCard 
              key={service.id} 
              title={service.title}
              description={service.description}
              image={service.image}
              value={service.title}
              price={service.price}
              branches={branches}
            />
          ))}
          <div className="relative rounded-lg overflow-hidden h-full">
            <Image
              src="/assets/service/Banner.png"
              alt="More cleaning services"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Service;