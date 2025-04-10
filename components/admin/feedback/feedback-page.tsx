"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Search,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Filter,
  SlidersHorizontal,
  Flag,
  Pin,
  RotateCcw
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FeedbackDetailsDialog } from "@/components/admin/feedback/feedbackDetails"
import AdminLayout from "@/components/admin/admin-layout"

// Mock feedback data
const mockFeedback = [
  {
    id: 1,
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    service: "Move-Out Cleaning",
    branch: "Toronto Downtown",
    staff: ["Emma Wilson", "David Lee"],
    rating: 5,
    comment: "Excellent service! The team was on time, professional, and thorough. My landlord was impressed with how clean the apartment was. I'll definitely use this service again when I move next time.",
    date: "2025-04-05T14:30:00",
    status: "published",
    response: null,
    images: [
      "https://example.com/feedback/image1.jpg",
      "https://example.com/feedback/image2.jpg"
    ]
  },
  {
    id: 2,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    service: "Deep Cleaning",
    branch: "Mississauga",
    staff: ["Michael Brown", "Jessica Clark"],
    rating: 4,
    comment: "Very satisfied with the cleaning job. The team was professional and did a great job overall. The only small issue was they missed cleaning inside the oven, but everything else was perfect.",
    date: "2025-04-03T09:45:00",
    status: "published",
    response: "Thank you for your feedback, Sarah! We're glad you were satisfied with our service. We apologize for missing the oven cleaning and will make sure our teams double-check all appliances in the future.",
    images: []
  },
  {
    id: 3,
    customerName: "Michael Chen",
    customerEmail: "mchen@example.com",
    service: "Move-In Cleaning",
    branch: "North York",
    staff: ["Laura Taylor", "Mark Anderson"],
    rating: 2,
    comment: "Disappointed with the service. The team arrived an hour late and seemed rushed. Several areas were not properly cleaned, including bathroom corners and kitchen cabinets. Not worth the price paid.",
    date: "2025-04-02T16:20:00",
    status: "pending",
    response: null,
    images: [
      "https://example.com/feedback/image3.jpg"
    ]
  },
  {
    id: 4,
    customerName: "Emily Wilson",
    customerEmail: "emily.w@example.com",
    service: "Carpet Cleaning",
    branch: "Etobicoke",
    staff: ["Kevin Wilson"],
    rating: 5,
    comment: "Amazing results! Our carpets haven't looked this good in years. Kevin was professional, explained the process clearly, and finished ahead of schedule. Highly recommend!",
    date: "2025-04-01T11:15:00",
    status: "published",
    response: "Thank you for your kind words, Emily! We're thrilled that you're happy with the results. Kevin is one of our best technicians, and we'll pass along your compliments.",
    images: []
  },
  {
    id: 5,
    customerName: "Robert Davis",
    customerEmail: "rdavis@example.com",
    service: "Window Cleaning",
    branch: "Toronto Downtown",
    staff: ["James Martin", "Nicole Brown"],
    rating: 3,
    comment: "The service was okay. Windows are clean but there were some streaks left on several panes. The team was friendly and professional though.",
    date: "2025-03-30T13:40:00",
    status: "published",
    response: null,
    images: []
  },
  {
    id: 6,
    customerName: "Jennifer Lee",
    customerEmail: "jlee@example.com",
    service: "Move-Out Cleaning",
    branch: "Ottawa Central",
    staff: ["Christopher White", "Elizabeth Davis"],
    rating: 1,
    comment: "Terrible experience. The cleaning was inadequate, and I ended up losing part of my security deposit because of areas they missed. They also damaged a wall fixture and refused to take responsibility.",
    date: "2025-03-29T10:25:00",
    status: "flagged",
    response: null,
    images: [
      "https://example.com/feedback/image4.jpg",
      "https://example.com/feedback/image5.jpg"
    ]
  },
  {
    id: 7,
    customerName: "David Thompson",
    customerEmail: "david.t@example.com",
    service: "Appliance Cleaning",
    branch: "Mississauga",
    staff: ["Susan White"],
    rating: 5,
    comment: "Susan did an incredible job cleaning our appliances. The oven and refrigerator look brand new! Very impressed with the attention to detail.",
    date: "2025-03-28T15:10:00",
    status: "published",
    response: "Thank you for your feedback, David! We're glad Susan was able to exceed your expectations. We pride ourselves on our attention to detail.",
    images: []
  },
]

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState(mockFeedback)
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const itemsPerPage = 5

  // Filter feedback based on search term and rating
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === null || item.rating === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFeedback = filteredFeedback.slice(startIndex, startIndex + itemsPerPage)

  // View feedback details
  const handleViewFeedback = (item: any) => {
    setSelectedFeedback(item)
    setIsDetailsDialogOpen(true)
  }

  // Calculate average rating
  const averageRating = feedback.length > 0
    ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
    : "0.0";

  // Count feedback by rating
  const ratingCounts = feedback.reduce((counts, item) => {
    counts[item.rating] = (counts[item.rating] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold mr-2">{averageRating}</span>
                <div className="flex">{renderStars(Math.round(parseFloat(averageRating)))}</div>
              </div>
              <p className="text-sm text-gray-500 mt-1">From {feedback.length} reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex">
                    {Array(rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(ratingCounts[rating] || 0) / feedback.length * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 min-w-[30px] text-right">
                    {ratingCounts[rating] || 0}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Positive Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ThumbsUp className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-3xl font-bold">
                    {(feedback.filter(item => item.rating >= 4).length / feedback.length * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-500">rated 4-5 stars</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Negative Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ThumbsDown className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <div className="text-3xl font-bold">
                    {(feedback.filter(item => item.rating <= 2).length / feedback.length * 100).toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-500">rated 1-2 stars</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>
                  View and manage customer feedback and reviews
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRatingFilter(null)}>All Ratings</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRatingFilter(5)}>
                      <div className="flex items-center">
                        {renderStars(5)}
                        <span className="ml-2">5 stars</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRatingFilter(4)}>
                      <div className="flex items-center">
                        {renderStars(4)}
                        <span className="ml-2">4 stars</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRatingFilter(3)}>
                      <div className="flex items-center">
                        {renderStars(3)}
                        <span className="ml-2">3 stars</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRatingFilter(2)}>
                      <div className="flex items-center">
                        {renderStars(2)}
                        <span className="ml-2">2 stars</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRatingFilter(1)}>
                      <div className="flex items-center">
                        {renderStars(1)}
                        <span className="ml-2">1 star</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedFeedback.length > 0 ? (
                paginatedFeedback.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {item.customerName.split(' ').map(name => name[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{item.customerName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {renderStars(item.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {format(new Date(item.date), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">{item.service}</span> • {item.branch}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === "flagged" && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                          {item.status === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewFeedback(item)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Respond to Review</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {item.status === "published" ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {item.status === "flagged" ? "Remove Flag" : "Flag Review"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700">
                          {item.comment.length > 200 
                            ? `${item.comment.substring(0, 200)}...` 
                            : item.comment}
                        </p>
                        {item.comment.length > 200 && (
                          <Button 
                            variant="link" 
                            className="px-0 h-auto font-medium" 
                            onClick={() => handleViewFeedback(item)}
                          >
                            Read more
                          </Button>
                        )}
                      </div>

                      {item.images.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            View {item.images.length} Image{item.images.length > 1 ? 's' : ''}
                          </Button>
                        </div>
                      )}

                      {item.response && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>ST</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium">Spotless Transitions</span>
                                <MessageCircle className="h-3 w-3 ml-2 text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {item.response.length > 150 
                                  ? `${item.response.substring(0, 150)}...` 
                                  : item.response}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <MessageCircle className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No feedback found</h3>
                  <p className="text-gray-500 text-center mt-2">
                    {searchTerm || ratingFilter 
                      ? "Try adjusting your search or filter" 
                      : "No customer feedback yet"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredFeedback.length)}
                </span>{" "}
                of <span className="font-medium">{filteredFeedback.length}</span> reviews
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      <FeedbackDetailsDialog
        isOpen={isDetailsDialogOpen}
        setIsOpen={setIsDetailsDialogOpen}
        feedback={selectedFeedback}
      />
    </AdminLayout>
  )}