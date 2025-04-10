import React from "react";
import { Card } from "../../ui/card";
import Image from "next/image";
import { Button } from "../../ui/button";
import { ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";

const ServiceCard = ({
  title,
  description,
  image,
  category,
  duration = "3h - 4h",
  price = "$62/h",
}: {
  title: string;
  description: string;
  image: string;
  category: string;
  duration?: string;
  price?: string;
}) => {
  return (
    <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow duration-200 rounded-lg border-0 h-full flex flex-col">
      <div className="relative h-72 w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-4 flex gap-4 left-10">
          <div className="bg-white text-black text-sm rounded-full px-4 py-2 font-medium flex items-center gap-2">
            <span>
              Duration: <span className="text-green-500">{duration}</span>
            </span>
            <span>
              Price: <span className="text-green-500">{price}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-md mb-2 uppercase">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">{description}</p>

        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <div className="flex items-center justify-between border rounded-md p-1 px-3 flex-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Location
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>

          <Button className="bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 flex-1">
            
          <Link href="/booking">BOOK NOW</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
