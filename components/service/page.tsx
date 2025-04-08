import React from "react";
import { services } from "./serviceData";
import ServiceCard from "./ServiceCard";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

function Service() {
  return (
    <section className="py-24" id="services">
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
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 flex items-center">
              EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
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