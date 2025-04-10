import Hero from "@/components/landingPage/heroSection/page";
import AboutUs from "../components/landingPage/aboutUs/page";
import Service from "@/components/landingPage/service/page";
import CTABanner from "@/components/landingPage/CTABanner/page";
import WhyUs from "@/components/landingPage/whyus/page";
import ContactSection from "@/components/landingPage/contact/page";

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
