import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Home, FileText, User, Calendar, CreditCard, Clock, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";

const UserProfileCard = ({ pathname }: any) => {
  const [isExpanded, setIsExpanded] = useState(
    pathname === "/dashboard" || pathname === "/dashboard/profile"
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const { email, firstName, lastName } = user?.user_metadata || {};
  const dashboardIsActive = pathname === "/dashboard" || pathname === "/dashboard/profile";

  const navigation = [
    { name: "BOOKING HISTORY", href: "/dashboard/booking-history", icon: FileText },
    { name: "UPCOMING APPOINTMENTS", href: "/dashboard/appointments", icon: Calendar },
    { name: "PAYMENT & INVOICE", href: "/dashboard/payments", icon: CreditCard },
    { name: "REQUEST RESCHEDULE", href: "/dashboard/reschedule", icon: Clock },
    { name: "REQUEST CANCELLATION", href: "/dashboard/cancellation", icon: X },
    { name: "MEDIA REVIEW", href: "/dashboard/media-review", icon: ImageIcon },
  ];

  return (
    <Card className="w-full max-w-sm h-auto max-h-[600px]">
      <CardContent className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                <Image src="/assets/userPhoto.jpg" alt="User" width={48} height={48} />
              </div>
              <div>
                <h3 className="font-bold">{firstName + ' ' + lastName}</h3>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
          </>
        )}
            
            <nav className="mb-10">
              <div className="mb-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn("w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md", dashboardIsActive ? "text-green-500" : "text-gray-700 hover:text-green-500")}
                >
                  <div className="flex items-center gap-3">
                    <Home className={cn("h-5 w-5", dashboardIsActive ? "text-green-500" : "text-gray-400 group-hover:text-green-500")} />
                    DASHBOARD
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    <Link href="/dashboard" className={cn("group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md", pathname === "/dashboard" ? "text-green-500" : "text-gray-700 hover:text-green-500")}>
                      <FileText className={cn("h-5 w-5", pathname === "/dashboard" ? "text-green-500" : "text-gray-400 group-hover:text-green-500")} />
                      OVERVIEW
                    </Link>
                    <Link href="/dashboard/profile" className={cn("group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md", pathname === "/dashboard/profile" ? "text-green-500" : "text-gray-700 hover:text-green-500")}>
                      <User className={cn("h-5 w-5", pathname === "/dashboard/profile" ? "text-green-500" : "text-gray-400 group-hover:text-green-500")} />
                      MY PROFILE
                    </Link>
                  </div>
                )}
              </div>
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className={cn("group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md", pathname === item.href ? "text-green-500" : "text-gray-700 hover:text-green-500")}>
                  <item.icon className={"h-5 w-5 text-green-500"} />
                  {item.name}
                </Link>
              ))}
            </nav>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
