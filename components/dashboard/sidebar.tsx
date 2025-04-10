import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Home, FileText, User, Calendar, CreditCard, Clock, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";

const ClientSidebar = ({ pathname }: { pathname: string }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  const { email, firstName, lastName } = user?.user_metadata || {};

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: Home,
      subItems: [
        { name: "Overview", href: "/dashboard", icon: FileText },
        { name: "My Profile", href: "/dashboard/profile", icon: User }
      ]
    },
    { name: "Booking History", href: "/dashboard/booking-history", icon: FileText },
    { name: "Upcoming Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "Payment & Invoice", href: "/dashboard/payments", icon: CreditCard },
    { name: "Request Reschedule", href: "/dashboard/reschedule", icon: Clock },
    { name: "Request Cancellation", href: "/dashboard/cancellation", icon: X },
    { name: "Media Review", href: "/dashboard/media-review", icon: ImageIcon },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <Card className="hidden lg:flex w-full max-w-sm h-auto max-h-[600px]">
      <CardContent className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-8">
            <div className="hidden xl:flex h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
              <Image src="/assets/userPhoto.jpg" alt="User" width={48} height={48} />
            </div>
            <div>
              <h3 className="font-bold">{firstName + ' ' + lastName}</h3>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
        )}
        
        <nav className="mb-10 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                <>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                      isActive(item.href) || item.subItems.some(sub => isActive(sub.href)) 
                        ? "text-green-500" 
                        : "text-gray-700 hover:text-green-500"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                  
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                          isActive(subItem.href) 
                            ? "text-green-500" 
                            : "text-gray-700 hover:text-green-500"
                        )}
                      >
                        <subItem.icon className="h-5 w-5 text-green-500" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                    isActive(item.href) 
                      ? "text-green-500" 
                      : "text-gray-700 hover:text-green-500"
                  )}
                >
                  <item.icon className="h-5 w-5 text-green-500" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};

export default ClientSidebar;