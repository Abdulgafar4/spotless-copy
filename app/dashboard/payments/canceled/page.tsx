"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";

export default function PaymentCanceledPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Payment Canceled</h1>
          <p className="text-gray-600 mt-2">
            Your payment was canceled or not completed. No charges were made.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>What would you like to do next?</CardTitle>
            <CardDescription>
              You can try again or return to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">
              If you encountered any issues during the payment process, please make sure:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-4">
              <li>Your card details were entered correctly</li>
              <li>Your card has sufficient funds</li>
              <li>You have authorized online payments for your card</li>
              <li>The payment wasn't blocked by your bank's security measures</li>
            </ul>
            <p className="text-sm text-gray-600">
              If you continue to have problems, please contact our support team.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button 
              className="w-full flex items-center justify-center"
              onClick={() => router.push("/dashboard/payments")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}