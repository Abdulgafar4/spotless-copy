"use client"
import React, { useState } from "react";
import { Card } from "../../ui/card";
import Image from "next/image";
import { Button } from "../../ui/button";
import { MapPin } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface Branch {
  id: string;
  name: string;
}

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  value: string;
  price: number;
  branches: Branch[];
}

const ServiceCard = ({
  title,
  description,
  image,
  value,
  price,
  branches,
}: ServiceCardProps) => {
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow duration-200 rounded-lg border-0 h-full flex flex-col">
      <div className="relative h-72 w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-4 flex justify-center w-full">
          <div className="bg-white text-black text-sm rounded-full px-4 py-2 font-medium flex items-center gap-2">
            <span>
              Minimum Price: <span className="text-green-500">{formatCurrency(price)}/hr</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-md mb-2 uppercase">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">{description}</p>

        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <Select
            value={selectedBranch}
            onValueChange={setSelectedBranch}
          >
            <SelectTrigger className="flex justify-between border rounded-md p-1  flex-1">
              <MapPin className="h-4 w-4" />
              <span>

                {selectedBranch
                  ? branches.find((b) => b.name === selectedBranch)?.name
                  : "Location"}
              </span>

            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 flex-1"
            asChild
          >
            <Link
              href={{
                pathname: "/booking",
                query: {
                  service: value,
                  branch: selectedBranch
                }
              }}
            >
              BOOK NOW
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
