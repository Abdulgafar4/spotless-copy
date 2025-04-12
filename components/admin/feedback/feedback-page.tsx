"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Search,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Filter,
  Flag,
  RotateCcw,
  Loader2,
  AlertCircle
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FeedbackDetailsDialog } from "@/components/admin/feedback/feedbackDetails"
import AdminLayout from "@/components/admin/admin-layout"
import { useReviews } from "@/hooks/use-reviews"

export default function FeedbackPage() {
  const {
    reviews,
    loading,
    error,
    fetchReviews,
    updateReview,
    deleteReview
  } = useReviews();

  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const itemsPerPage = 5

  // Filter feedback based on search term and rating
  const filteredFeedback = reviews.filter(item => {
    const matchesSearch =
      item?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Count feedback by rating
  const ratingCounts = reviews.reduce((counts, item) => {
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

  // Handle review deletion
  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  if (loading && !reviews.length) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <h3 className="mt-2 text-lg font-medium">Error loading feedback</h3>
            <p className="mt-1 text-sm text-gray-500">{error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={fetchReviews}
            >
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Loading overlay for subsequent loads */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Loading feedback...</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
        </div>

        {/* Stats Cards */}
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
              <p className="text-sm text-gray-500 mt-1">From {reviews.length} reviews</p>
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
                      style={{ width: `${(ratingCounts[rating] || 0) / reviews.length * 100}%` }}
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
                    {(reviews.filter(item => item.rating >= 4).length / reviews.length * 100 || 1).toFixed(0)}%
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
                    {(reviews.filter(item => item.rating <= 2).length / reviews.length * 100 || 1).toFixed(0)}%
                  </div>
                  <p className="text-sm text-gray-500">rated 1-2 stars</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
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
                    disabled={loading}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={loading}>
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Rating</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRatingFilter(null)}>All Ratings</DropdownMenuItem>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <DropdownMenuItem key={rating} onClick={() => setRatingFilter(rating)}>
                        <div className="flex items-center">
                          {renderStars(rating)}
                          <span className="ml-2">{rating} stars</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
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
                              {item?.user_name?.split(' ').map(name => name[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{item.user_name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {renderStars(item.rating)}
                              </div>
                              <span className="text-sm text-gray-500">
                                {format(new Date(item.created_at), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {item.booking_id && `Booking #${item.booking_id}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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

                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteReview(item.id)}
                              >
                                Delete
                              </DropdownMenuItem>
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
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
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
  )
}