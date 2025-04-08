import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getAdminNavigation } from "./adminDummyData";


const SidebarCard = ({ pathname }: any) => {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    if (user?.user_metadata?.firstName) {
      setAdminName(user.user_metadata.firstName);
    }
  }, [user]);

  return (
    <Card className="hidden lg:flex w-full max-w-[300px] h-auto max-h-[600px] mt-6">
      <CardContent className="p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">{adminName}</span>
            </p>
          </div>
        </div>
        <nav className="my-5">
          {getAdminNavigation(pathname).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "text-green-500"
                  : "text-gray-700 hover:text-green-500"
              )}
            >
              <item.icon className={"h-5 w-5 text-green-500"} />
              {item.name}
            </Link>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};

export default SidebarCard;
