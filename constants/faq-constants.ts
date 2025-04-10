

import { Home, DollarSign, Calendar, Settings, Briefcase, Users, ShieldCheck, HelpCircle } from "lucide-react"


export const faqCategories = [
    {
      id: "services",
      name: "Our Services",
      icon: Briefcase,
      items: [
        {
          question: "What services does Spotless Transitions offer?",
          answer:
            "Spotless Transitions offers a comprehensive range of cleaning and repair services, including move-out cleaning, move-in cleaning, appliance and kitchen cleaning, repairs and maintenance, painting and touch-ups, carpet and floor cleaning, window cleaning, and pre-sale home assistance.",
        },
        {
          question: "Do you provide same-day service?",
          answer:
            "While we strive to accommodate urgent requests, same-day service depends on our current schedule and availability. We recommend booking at least 48 hours in advance to ensure we can meet your needs. For urgent requests, please contact our customer service team directly.",
        },
        {
          question: "What is included in your move-out cleaning service?",
          answer:
            "Our move-out cleaning service includes deep cleaning of all rooms and surfaces, kitchen appliance cleaning (inside and out), bathroom sanitization and descaling, window cleaning (interior), carpet vacuuming and spot cleaning, dust removal from all surfaces including baseboards and ceiling fans, floor washing and polishing, and trash removal.",
        },
        {
          question: "Do you offer specialized cleaning for specific surfaces or materials?",
          answer:
            "Yes, we offer specialized cleaning for various surfaces including hardwood floors, marble, granite, stainless steel, and delicate fabrics. Our technicians are trained in the proper cleaning techniques and use appropriate products for each surface type to ensure effective cleaning without causing damage.",
        },
        {
          question: "Can you handle pest control as part of your services?",
          answer:
            "We do not provide pest control services directly. However, we can recommend trusted pest control partners in your area who can address these issues before or after our cleaning services.",
        },
      ],
    },
    {
      id: "booking",
      name: "Booking & Scheduling",
      icon: Calendar,
      items: [
        {
          question: "How do I book a service?",
          answer:
            "You can book our services online through our website by visiting the Services page, selecting the service you need, and following the booking process. Alternatively, you can call our customer service team to book over the phone.",
        },
        {
          question: "What is your cancellation policy?",
          answer:
            "We understand that plans can change. You can reschedule or cancel your appointment up to 24 hours before the scheduled service without any charge. Cancellations with less than 24 hours' notice may incur a fee of 50% of the service cost.",
        },
        {
          question: "How far in advance should I book a service?",
          answer:
            "We recommend booking at least 3-5 days in advance to ensure availability, especially during peak seasons. For move-out cleanings, we suggest booking 1-2 weeks ahead if possible. Last-minute bookings may be accommodated based on availability.",
        },
        {
          question: "Can I schedule recurring cleaning services?",
          answer:
            "Yes, we offer flexible recurring cleaning schedules including weekly, bi-weekly, monthly, or custom frequencies. Recurring service clients receive priority scheduling and special discounted rates. You can easily manage your recurring schedule through your online account.",
        },
        {
          question: "Do you offer weekend appointments?",
          answer:
            "Yes, we offer weekend appointments for most of our services, though availability may be limited. Weekend appointments may have a small additional fee depending on the service type and location. These appointments can be booked online or by contacting our customer service team.",
        },
      ],
    },
    {
      id: "pricing",
      name: "Pricing & Payment",
      icon: DollarSign,
      items: [
        {
          question: "How much do your services cost?",
          answer:
            "Our service prices vary depending on the type of service, the size of the property, and specific requirements. We provide transparent pricing during the booking process, and you'll receive a detailed quote before confirming your appointment.",
        },
        {
          question: "Do you offer any discounts or promotions?",
          answer:
            "Yes, we regularly offer seasonal promotions and discounts for first-time customers, recurring service bookings, and package deals. We also have a referral program where you can earn credits toward future services by referring friends and family. Check our website or subscribe to our newsletter for current promotions.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, Mastercard, American Express, Discover), digital payments (PayPal, Apple Pay, Google Pay), and bank transfers. For corporate clients, we also offer invoicing options with net-30 payment terms upon approval.",
        },
        {
          question: "When am I charged for the service?",
          answer:
            "For standard bookings, we require a 25% deposit at the time of booking to secure your appointment, with the remaining balance due upon completion of the service. For recurring service clients, we offer the option to set up automatic payments on a monthly basis.",
        },
        {
          question: "Do you offer a satisfaction guarantee?",
          answer:
            "Yes, we stand behind our work with a 100% satisfaction guarantee. If you're not completely satisfied with our service, please notify us within 24 hours, and we'll return to address any areas of concern at no additional cost. If we still can't meet your expectations, we'll provide a partial or full refund depending on the circumstances.",
        },
      ],
    },
    {
      id: "process",
      name: "Service Process",
      icon: Settings,
      items: [
        {
          question: "How long does a typical cleaning service take?",
          answer:
            "The duration depends on the service type and property size. A standard move-out cleaning for a 2-bedroom apartment typically takes 3-4 hours. We'll provide you with a time estimate when you book your service.",
        },
        {
          question: "Do I need to be present during the cleaning?",
          answer:
            "It's not necessary for you to be present during the entire cleaning process. However, we do require someone to provide access to the property and to do a final walkthrough to ensure your satisfaction with our work.",
        },
        {
          question: "What should I do to prepare for your service?",
          answer:
            "To help us provide the most efficient service, we recommend removing personal items and clutter from areas to be cleaned, securing pets in a safe area away from the cleaning zones, and ensuring our team has clear access to all areas that need attention. For move-out cleanings, the property should ideally be empty of furniture and personal belongings.",
        },
        {
          question: "How many cleaners will come to my property?",
          answer:
            "The size of our cleaning team depends on the scope of work and the size of your property. For standard residential cleanings, we typically send 2-3 technicians. Larger properties or more comprehensive services may require larger teams to ensure efficient completion within the scheduled timeframe.",
        },
        {
          question: "What happens if something is damaged during the service?",
          answer:
            "While our technicians take great care with your property, accidents can occasionally happen. We carry comprehensive insurance to cover any damages that might occur during our services. If you notice any damage, please report it to us within 24 hours of service completion, and our customer service team will guide you through our claims process.",
        },
      ],
    },
    {
      id: "locations",
      name: "Service Areas",
      icon: Home,
      items: [
        {
          question: "What areas do you serve?",
          answer:
            "We currently serve major cities across Canada, including Toronto, Ottawa, Kitchener, Guelph, Hamilton, and London. We're continuously expanding to new locations, so please check our website or contact us to confirm service availability in your area.",
        },
        {
          question: "Do you charge extra for services outside the city center?",
          answer:
            "For locations within our standard service areas, there are no additional travel fees. For properties located in suburban or rural areas outside our core service zones, a small travel fee may apply depending on the distance. This fee will be clearly communicated during the booking process.",
        },
        {
          question: "Can you service multiple properties under one booking?",
          answer:
            "Yes, we can arrange services for multiple properties under a single booking, which is particularly convenient for property managers and landlords. Please contact our customer service team directly to set up multi-property bookings and discuss potential volume discounts.",
        },
        {
          question: "Do you offer services for commercial properties?",
          answer:
            "Yes, in addition to residential services, we offer specialized cleaning and maintenance services for commercial properties including offices, retail spaces, and small businesses. Commercial clients can benefit from customized service plans and flexible scheduling options including after-hours services.",
        },
        {
          question: "Are there any types of properties you don't service?",
          answer:
            "We service most residential and commercial properties, but there may be limitations for industrial facilities, properties with hazardous materials, or extremely large commercial complexes. Please contact us with specific details about your property if you're unsure about eligibility for our services.",
        },
      ],
    },
    {
      id: "staff",
      name: "Our Staff",
      icon: Users,
      items: [
        {
          question: "How are your cleaning professionals trained?",
          answer:
            "All our cleaning professionals undergo a comprehensive training program covering cleaning techniques, proper use of equipment and products, safety protocols, and customer service standards. They receive both classroom and hands-on training, followed by supervised field experience before working independently.",
        },
        {
          question: "Are your staff background checked?",
          answer:
            "Yes, all our employees undergo thorough background checks and reference verification before joining our team. We prioritize your security and peace of mind, which is why we maintain strict hiring standards and regular performance evaluations.",
        },
        {
          question: "Will the same cleaners come each time for recurring services?",
          answer:
            "We strive to maintain consistency by sending the same team for recurring services whenever possible. This allows our staff to become familiar with your preferences and property. However, due to scheduling and availability, we cannot always guarantee the exact same team members for every visit.",
        },
        {
          question: "Can I request specific cleaners for my service?",
          answer:
            "Yes, if you've had a positive experience with specific team members, you can request them for future services. While we'll do our best to accommodate these requests, availability depends on scheduling and workload. You can make these requests during booking or by contacting our customer service team.",
        },
        {
          question: "Do your cleaners speak English?",
          answer:
            "Yes, all our team members have sufficient English language skills to communicate effectively with clients. Many of our staff are multilingual, which can be helpful in diverse communities. If you have specific language preferences, please let us know when booking, and we'll try to accommodate when possible.",
        },
      ],
    },
    {
      id: "products",
      name: "Products & Equipment",
      icon: ShieldCheck,
      items: [
        {
          question: "Do I need to provide cleaning supplies or equipment?",
          answer:
            "No, our professional cleaning teams bring all necessary cleaning supplies, equipment, and tools. We use high-quality, eco-friendly products unless you have specific preferences or requirements.",
        },
        {
          question: "Are your cleaning products safe for pets and children?",
          answer:
            "Yes, we prioritize using eco-friendly, non-toxic cleaning products that are safe for households with children and pets. If you have specific concerns or allergies, please let us know when booking, and we can adjust our cleaning approach accordingly.",
        },
        {
          question: "Can I request specific cleaning products to be used?",
          answer:
            "Yes, we're happy to accommodate requests for specific cleaning products. If you have preferred brands or products due to allergies, sensitivities, or personal preference, please inform us during booking. You can also provide your own products if you prefer, though this won't affect the service price.",
        },
        {
          question: "What kind of equipment do your technicians use?",
          answer:
            "Our technicians use professional-grade equipment including HEPA-filtered vacuum cleaners, steam cleaners, microfiber cleaning systems, and specialized tools for different surfaces and cleaning challenges. Our equipment is regularly maintained and updated to ensure optimal performance and cleaning results.",
        },
        {
          question: "Do you use green or environmentally friendly cleaning methods?",
          answer:
            "Yes, we're committed to environmentally responsible cleaning practices. We use EPA-certified green cleaning products, microfiber technology that requires fewer chemicals, water-efficient cleaning methods, and HEPA-filtered equipment that improves air quality. We continuously evaluate and improve our practices to reduce environmental impact.",
        },
      ],
    },
    {
      id: "other",
      name: "Other Questions",
      icon: HelpCircle,
      items: [
        {
          question: "Do you offer gift certificates?",
          answer:
            "Yes, we offer gift certificates for all our services, which make thoughtful gifts for new homeowners, busy parents, seniors, or anyone who could use the gift of a clean home. Gift certificates can be purchased online or by contacting our customer service team, and they're available in various denominations or for specific services.",
        },
        {
          question: "How do I provide feedback about my service?",
          answer:
            "We value your feedback and use it to continuously improve our services. After each service, you'll receive an email with a link to a short satisfaction survey. You can also provide feedback through your online account, by calling our customer service team, or by speaking directly with your cleaning team during the final walkthrough.",
        },
        {
          question: "Do you have a loyalty program?",
          answer:
            "Yes, we have a loyalty program that rewards our regular customers. You earn points for each service, which can be redeemed for discounts on future bookings, free add-on services, or product upgrades. Loyalty program members also receive priority scheduling and exclusive promotions throughout the year.",
        },
        {
          question: "What happens if I need to change the scope of work after booking?",
          answer:
            "We understand that needs can change. If you need to modify the scope of work after booking, please contact us as soon as possible. Minor adjustments can often be accommodated without affecting your scheduled time. Significant changes may require rescheduling or price adjustments, which we'll discuss with you before proceeding.",
        },
        {
          question: "Do you offer emergency cleaning services?",
          answer:
            "Yes, we offer emergency cleaning services for urgent situations such as pre-move cleanings with tight deadlines, last-minute showing preparations, or unexpected guests. Emergency services are subject to availability and may include an additional fee. Please contact our customer service team directly for emergency service requests.",
        },
      ],
    },
  ]