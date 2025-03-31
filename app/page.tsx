import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react";
import Hero from "@/components/heroSection/page";
import AboutUs from "../components/aboutUs/page";
import Service from "@/components/service/page";
import CTABanner from "@/components/CTABanner/page";
import WhyUs from "@/components/whyus/page";
import ContactSection from "@/components/contact/page";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <AboutUs />
      <Service />
      <CTABanner />
      <WhyUs />
      <ContactSection />
    </div>
  );
}
