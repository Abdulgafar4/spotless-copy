import { FileText, Calendar, CreditCard, Clock, X, Image as ImageIcon, User } from 'lucide-react';

export const clientNavigation = [
  { name: "Overview", href: "/dashboard", icon: FileText },
  { name: "My Profile", href: "/dashboard/profile", icon: User },
  { name: "Booking History", href: "/dashboard/booking-history", icon: FileText },
  { name: "Upcoming Appointment", href: "/dashboard/appointments", icon: Calendar },
  { name: "Payment & Invoice", href: "/dashboard/payments", icon: CreditCard },
  { name: "Request Reschedule", href: "/dashboard/reschedule", icon: Clock },
  { name: "Request Cancellation", href: "/dashboard/cancellation", icon: X },
  { name: "Media Review", href: "/dashboard/media-review", icon: ImageIcon },
];