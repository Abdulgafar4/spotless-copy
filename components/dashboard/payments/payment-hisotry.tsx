import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  ArrowDown, 
  FileText, 
  Calendar, 
  CreditCard,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  date: string;
  invoice_url?: string;
  booking?: {
    id: string;
    service_type: string;
    date: string;
  };
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusConfig = {
    paid: {
      className: "bg-green-100 text-green-800 border-green-200",
      label: "Paid",
      icon: CheckCircle,
    },
    refunded: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      label: "Refunded",
      icon: ArrowDown,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      label: "Pending",
      icon: FileText,
    },
    failed: {
      className: "bg-red-100 text-red-800 border-red-200",
      label: "Failed",
      icon: XCircle,
    },
  };

  const methodLabels = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
  };

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

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const status = payment.status;
              const config = statusConfig[status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">#{payment.id}</TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className={config.className}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {methodLabels[payment.method] || payment.method}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedPayment && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment Details
              </DialogTitle>
              <DialogDescription>
                Payment #{selectedPayment.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-xl font-bold">{formatCurrency(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge 
                    className={
                      statusConfig[selectedPayment.status]?.className || 
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusConfig[selectedPayment.status]?.label || selectedPayment.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Date</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{formatDate(selectedPayment.date)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <p>{methodLabels[selectedPayment.method] || selectedPayment.method}</p>
                  </div>
                </div>
              </div>
              
              {selectedPayment.booking && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Service Details</h4>
                  <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="font-medium">{selectedPayment.booking.service_type}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Service date: {formatDate(selectedPayment.booking.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking ID: #{selectedPayment.booking_id}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
              {selectedPayment.invoice_url && (
                <Button 
                  variant="outline"
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                  onClick={() => window.open(selectedPayment.invoice_url, '_blank')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Download Invoice
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}