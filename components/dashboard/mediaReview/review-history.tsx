import { useState } from "react";
import { Star, Calendar, Image as ImageIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  service_type: string;
  branch: string;
}

interface Review {
  id: string;
  appointment_id: string;
  staff_name: string;
  rating: number;
  comment: string;
  images?: string[];
  created_at: string;
  appointment?: Appointment;
}

interface ReviewHistoryProps {
  reviews: Review[];
}

export function ReviewHistory({ reviews }: ReviewHistoryProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString('en-US', options);
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {review.appointment?.service_type || "Service"}
                </Badge>
                <h3 className="font-bold">Review for {review.staff_name}</h3>
              </div>
              <div className="text-sm text-gray-500">
                {formatDateTime(review.created_at)}
              </div>
            </div>
            
            <div className="mb-3">
              {renderRatingStars(review.rating)}
            </div>
            
            <p className="text-gray-700 mb-4">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                <div className="flex flex-wrap gap-2">
                  {review.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <img src={image} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Calendar className="h-4 w-4" />
              <span>Service date: {review.appointment ? formatDate(review.appointment.date) : "N/A"}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-3 text-blue-600"
              onClick={() => setSelectedReview(review)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
      
      {/* Review Details Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Review Details</DialogTitle>
              <DialogDescription>
                Submitted on {formatDateTime(selectedReview.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Service Information</h4>
                <p className="font-medium mt-1">{selectedReview.appointment?.service_type || "N/A"}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedReview.appointment ? formatDate(selectedReview.appointment.date) : "N/A"}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Staff Member</h4>
                <p className="mt-1">{selectedReview.staff_name}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                <div className="mt-1">
                  {renderRatingStars(selectedReview.rating)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Your Review</h4>
                <p className="mt-1">{selectedReview.comment}</p>
              </div>
              
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReview.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                        onClick={() => handleImageClick(image)}
                      >
                        <img src={image} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Image View Dialog */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] p-0 bg-transparent border-none shadow-none">
          <button 
            className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-1"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          {selectedImage && (
            <div className="max-h-[80vh] flex justify-center items-center">
              <img 
                src={selectedImage} 
                alt="Review image" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}