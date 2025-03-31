import React from "react";
import Image from "next/image";

// Define the Feature component props interface
interface FeatureProps {
  icon: string;
  title: string;
  description: string;
}

// Create a reusable Feature component with TypeScript typing
const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="min-w-16">
        <Image
          src={`/assets/${icon}.png`}
          alt={title}
          width={60}
          height={60}
        />
      </div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
      </div>
    </div>
  );
};

// Define the main AboutUs component
const AboutUs: React.FC = () => {
  // Define features data with appropriate interface
  const features: FeatureProps[] = [
    {
      icon: "high-quality",
      title: "HIGH-QUALITY SERVICES",
      description: "Provide high-quality cleaning and repair services that meet landlord and buyer expectations."
    },
    {
      icon: "convenient",
      title: "CONVENIENT & EFFICIENT SOLUTIONS",
      description: "Offer a convenient and efficient solution for renters, sellers, and realtors."
    },
    {
      icon: "expand",
      title: "EXPAND ACROSS CANADA",
      description: "Expand operations across major Canadian cities through a scalable franchise model."
    },
    {
      icon: "efficient",
      title: "EFFICIENT TEAM",
      description: "Establish a reputation as the go-to service for move-out and pre-sale property preparation."
    },
    {
      icon: "eco",
      title: "ECHO FRIENDLY",
      description: "Maintain environmentally friendly cleaning practices."
    },
    {
      icon: "partnership",
      title: "STRONG PARTNERSHIP",
      description: "Build strong relationships with realtors, property managers, and landlords for consistent growth."
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 mt-4 sm:mt-8">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 mb-6 md:mb-0">
          <Image
            src="/assets/aboutus/cleaning-team.png"
            alt="Cleaning team"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-4 sm:space-y-6 flex flex-col justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold">
            <span className="text-green-500 font-serif">SPOTLESS TRANSITIONS</span>
            <br />
            <span className="text-xl sm:text-2xl font-light">
              CLEANING AND REPAIR SERVICES
            </span>
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Our company specializes in helping renters, homeowners, and realtors
            prepare properties for smooth transitions. We provide top-tier cleaning,
            repairs, painting, and general maintenance services to ensure homes are in
            pristine condition for move-outs, property sales, or ownership transfers. Our
            goal is to maximize security deposit returns for tenants and enhance property
            value for sellers and realtors.
          </p>
          <p className="text-gray-700 text-sm sm:text-base">
            To provide seamless and stress-free move-out and pre-sale cleaning services
            that ensure properties are handed over in pristine condition, maximizing value
            and satisfaction for tenants, homeowners, and realtors.
          </p>
        </div>
      </div>
    </div>
  
    <div className="container mx-auto px-4 md:px-6 mt-8 sm:mt-12 md:mt-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <Feature
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  </section>
  );
};

export default AboutUs;