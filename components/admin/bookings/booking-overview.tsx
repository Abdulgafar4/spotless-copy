import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

export const BookingOverviewCards: React.FC<BookingOverviewCardsProps> = ({ 
  bookings, 
  upcomingBookings, 
  todayBookings, 
  countByStatus 
}) => {
  const cardData = [
    { 
      title: "All Bookings", 
      value: bookings.length, 
      description: "Total bookings" 
    },
    { 
      title: "Upcoming", 
      value: upcomingBookings, 
      description: "Scheduled bookings" 
    },
    { 
      title: "Today", 
      value: todayBookings, 
      description: "Today's appointments" 
    },
    { 
      title: "Pending", 
      value: countByStatus.pending || 0, 
      description: "Awaiting confirmation" 
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cardData.map(({ title, value, description }) => (
        <Card key={title}>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-sm text-gray-500">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
