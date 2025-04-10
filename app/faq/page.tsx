"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import PageHeader from "@/components/page-header"
import { faqCategories } from "@/constants/faq-constants"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredFaqs, setFilteredFaqs] = useState(faqCategories)
  const [activeTab, setActiveTab] = useState("all")

  // Filter FAQs based on both search term and active tab
  useEffect(() => {
    // Step 1: Filter by tab first
    let tabFiltered = faqCategories
    if (activeTab !== "all") {
      tabFiltered = faqCategories.filter((category) => category.id === activeTab)
    }

    // Step 2: Then filter by search term if one exists
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase()
      const searchFiltered = tabFiltered.map((category) => {
        const filteredItems = category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchTermLower) ||
            item.answer.toLowerCase().includes(searchTermLower),
        )
        return { ...category, items: filteredItems }
      }).filter((category) => category.items.length > 0)
      
      setFilteredFaqs(searchFiltered)
    } else {
      // If no search term, just use the tab filter
      setFilteredFaqs(tabFiltered)
    }
  }, [activeTab, searchTerm])

  return (
    <div className="flex flex-col mt-10">
      <PageHeader
        title="FREQUENTLY ASKED QUESTIONS"
        breadcrumbs={[
          { label: "HOME", href: "/" },
          { label: "FAQ", href: "/faq", current: true },
        ]}
      />

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How Can We Help You?</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to commonly asked questions about our services, booking process, and more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 h-12 rounded-full border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Category Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-full py-2 px-4"
              >
                All Questions
              </TabsTrigger>
              {faqCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-full py-2 px-4"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* FAQ Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((category) => (
                  <div key={category.id} className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="bg-green-100 text-green-600 p-2 rounded-full mr-3">
                        <category.icon className="h-5 w-5" />
                      </span>
                      {category.name}
                    </h2>

                    <Accordion type="single" collapsible className="space-y-4">
                      {category.items.map((faq, index) => (
                        <AccordionItem
                          key={index}
                          value={`${category.id}-item-${index}`}
                          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pt-2 pb-4 bg-white text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any FAQs matching your search. Please try different keywords.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setActiveTab("all")
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-green-50 rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-6">
                  If you couldn't find the answer to your question, please don't hesitate to contact our support team.
                </p>
                <div className="space-y-4">
                  <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <Link href="/contact-us">Contact Support</Link>
                  </Button>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg 
                        className="h-5 w-5 text-green-600" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Call us at</p>
                      <p className="font-medium">(123) 456-7890</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg 
                        className="h-5 w-5 text-green-600" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email us at</p>
                      <p className="font-medium">support@spotless.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}