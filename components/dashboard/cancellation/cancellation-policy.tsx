import { InfoIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CancellationPolicy() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Cancellation Policy</CardTitle>
        </div>
        <CardDescription>
          Please review our cancellation policy before submitting a request
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <p>
            We understand that plans change. To accommodate this while maintaining our scheduling system's integrity, our cancellation policy is as follows:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3">
              <h4 className="font-medium text-green-700 mb-2">No Fee Cancellation</h4>
              <p className="text-gray-600">
                Cancellations made <strong>more than 3 days</strong> before your scheduled appointment will not incur any fees.
              </p>
            </div>
            
            <div className="border rounded-md p-3 border-amber-200 bg-amber-50">
              <h4 className="font-medium text-amber-700 mb-2">3 Days Notice</h4>
              <p className="text-amber-700">
                Cancellations made <strong>exactly 3 days</strong> before your appointment will incur a <strong>50% fee</strong> of the service cost.
              </p>
            </div>
            
            <div className="border rounded-md p-3 border-amber-200 bg-amber-50">
              <h4 className="font-medium text-amber-700 mb-2">2 Days Notice</h4>
              <p className="text-amber-700">
                Cancellations made <strong>2 days</strong> before your appointment will incur a <strong>75% fee</strong> of the service cost.
              </p>
            </div>
            
            <div className="border rounded-md p-3 border-red-200 bg-red-50">
              <h4 className="font-medium text-red-700 mb-2">Same Day or Next Day</h4>
              <p className="text-red-700">
                Cancellations made <strong>within 24-48 hours</strong> of your appointment will incur a <strong>100% fee</strong> of the service cost.
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            All cancellation requests are subject to review. Fees may be waived in exceptional circumstances at management's discretion. 
            Repeated cancellations may affect future booking privileges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}