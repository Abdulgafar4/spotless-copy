import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, CreditCard, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  date: string;
  booking?: {
    id: string;
    service_type: string;
    date: string;
  };
}

interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "paypal" | "bank_account";
  details: {
    last4?: string;
    brand?: string;
    expiry?: string;
    name?: string;
    email?: string;
    bank_name?: string;
  };
  is_default: boolean;
}

interface PendingPaymentsProps {
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  onMakePayment: (paymentId: string, methodId: string) => Promise<boolean>;
}

const paymentFormSchema = z.object({
  methodId: z.string({
    required_error: "Please select a payment method",
  }),
});

export function PendingPayments({ 
  payments, 
  paymentMethods, 
  onMakePayment 
}: PendingPaymentsProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      methodId: paymentMethods.find(method => method.is_default)?.id || "",
    },
  });

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  const handlePayClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
    // Set default payment method if available
    const defaultMethod = paymentMethods.find(method => method.is_default);
    if (defaultMethod) {
      form.setValue("methodId", defaultMethod.id);
    }
  };

  const handleSubmit = async (values: z.infer<typeof paymentFormSchema>) => {
    if (!selectedPayment) return;
    
    setIsSubmitting(true);
    try {
      const success = await onMakePayment(selectedPayment.id, values.methodId);
      if (success) {
        setIsPaymentDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    if (method.type === "credit_card" || method.type === "debit_card") {
      return `${method.details.brand} •••• ${method.details.last4}${method.is_default ? ' (Default)' : ''}`;
    } else if (method.type === "paypal") {
      return `PayPal - ${method.details.email}${method.is_default ? ' (Default)' : ''}`;
    } else if (method.type === "bank_account") {
      return `${method.details.bank_name} •••• ${method.details.last4}${method.is_default ? ' (Default)' : ''}`;
    }
    return "Unknown payment method";
  };

  return (
    <div className="space-y-6">
      {payments.map((payment) => (
        <Card key={payment.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>#{payment.id}</CardTitle>
                <CardDescription>Due: {formatDate(payment.date)}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                <p className="text-sm text-yellow-600">Payment Pending</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {payment.booking && (
              <div className="space-y-2">
                <h4 className="font-medium">{payment.booking.service_type}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Service date: {formatDate(payment.booking.date)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>Booking ID: #{payment.booking_id}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between items-center">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Info className="h-4 w-4 mt-0.5" />
              <span>Payment due before service</span>
            </div>
            <Button 
              onClick={() => handlePayClick(payment)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Pay Now
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {/* Payment Dialog */}
      {selectedPayment && (
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Select a payment method to pay {formatCurrency(selectedPayment.amount)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
                  <CreditCard className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-medium">No payment methods available</p>
                  <p className="text-sm mt-1 mb-4">Please add a payment method first</p>
                  <Button 
                    onClick={() => {
                      setIsPaymentDialogOpen(false);
                      // In a real app, you would navigate to the payment methods tab
                    }}
                    variant="outline"
                  >
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="methodId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  {getPaymentMethodLabel(method)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Service</span>
                        <span>{selectedPayment.booking?.service_type || "Cleaning Service"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date</span>
                        <span>{formatDate(selectedPayment.booking?.date || selectedPayment.date)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                    </div>
                    
                    <DialogFooter className="mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPaymentDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : `Pay ${formatCurrency(selectedPayment.amount)}`}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}