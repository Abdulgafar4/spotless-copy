import Image from "next/image"
import BookingForm from "@/components/booking-form"
import PageHeader from "@/components/page-header"

export default function BookingPage() {
  return (
    <div className="flex flex-col min-h-screen mt-20">
      <PageHeader
        title="BOOK A SERVICE"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "BOOK A SERVICE", href: "/booking", current: true },
        ]}
      />

      <section className="py-12 my-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">BOOK A SERVICE</h2>
              <div className="border-b border-gray-200 mb-6"></div>
              <BookingForm />
            </div>

            {/* Company Information */}
            <div className="space-y-8 mx-auto">
              <div>
                <h2 className="text-3xl font-extrabold">
                  <span className="text-[#10b981]">WHY SPOTLESS</span> TRANSITION
                </h2>
                <p className="text-gray-600 text-xl uppercase font-medium">CLEANING AND REPAIR SERVICES</p>
              </div>

              <div className="space-y-6 w-full max-w-lg">
                <FeatureItem
                  icon="/assets/high-quality.png"
                  title="HIGH-QUALITY SERVICES"
                  description="Provide high-quality cleaning and repair services that meet landlord and buyer expectations."
                />

                <FeatureItem
                  icon="/assets/convenient.png"
                  title="CONVENIENT & EFFICIENT SOLUTIONS"
                  description="Offer a convenient and efficient solution for renters, sellers, and realtors."
                />

                <FeatureItem
                  icon="/assets/expand.png"
                  title="EXPAND ACROSS CANADA"
                  description="Expand operations across major Canadian cities through a scalable franchise model."
                />

                <FeatureItem
                  icon="/assets/efficient.png"
                  title="EFFICIENT TEAM"
                  description="Establish a reputation as the go-to service for move-out and pre-sale property preparation."
                />

                <FeatureItem
                  icon="/assets/eco.png"
                  title="ECHO FRIENDLY"
                  description="Maintain environmentally friendly cleaning practices."
                />

                <FeatureItem
                  icon="/assets/partnership.png"
                  title="STRONG PARTNERSHIP"
                  description="Build strong relationships with realtors, property managers, and landlords for consistent growth."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0">
        <Image src={icon || "/placeholder.svg"} alt={title} width={50} height={50} className="object-contain" />
      </div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

