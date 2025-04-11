"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Plus, Trash2, Check, Building, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";

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

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddPaymentMethod: (paymentMethodData: Omit<PaymentMethod, "id" | "user_id" | "is_default" | "created_at">) => Promise<PaymentMethod>;
  onSetDefault: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const creditCardSchema = z.object({
  cardNumber: z.string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number must not exceed 19 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardName: z.string().min(2, "Cardholder name is required"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvv: z.string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
});

const paypalSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const bankAccountSchema = z.object({
  accountName: z.string().min(2, "Account name is required"),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string()
    .min(5, "Account number is required")
    .regex(/^\d+$/, "Account number must contain only digits"),
  routingNumber: z.string()
    .min(9, "Routing number is required")
    .regex(/^\d+$/, "Routing number must contain only digits"),
});

export function PaymentMethods({ 
  paymentMethods, 
  onAddPaymentMethod,
  onSetDefault,
  onDelete
}: PaymentMethodsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"credit_card" | "paypal" | "bank_account">("credit_card");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Credit card form
  const creditCardForm = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  // PayPal form
  const paypalForm = useForm<z.infer<typeof paypalSchema>>({
    resolver: zodResolver(paypalSchema),
    defaultValues: {
      email: "",
    },
  });

  // Bank account form
  const bankAccountForm = useForm<z.infer<typeof bankAccountSchema>>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
    },
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type as "credit_card" | "paypal" | "bank_account");
  };

  const handleCreditCardSubmit = async (data: z.infer<typeof creditCardSchema>) => {
    setIsSubmitting(true);
    try {
      // Format card details
      const last4 = data.cardNumber.slice(-4);
      const expiry = `${data.expiryMonth}/${data.expiryYear}`;
      const brand = getBrandFromCardNumber(data.cardNumber);
      
      const result = await onAddPaymentMethod({
        type: "credit_card",
        details: {
          last4,
          brand,
          expiry,
          name: data.cardName
        }
      });
      
      if (result) {
        creditCardForm.reset();
        setIsAddDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaypalSubmit = async (data: z.infer<typeof paypalSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await onAddPaymentMethod({
        type: "paypal",
        details: {
          email: data.email
        }
      });
      
      if (result) {
        paypalForm.reset();
        setIsAddDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankAccountSubmit = async (data: z.infer<typeof bankAccountSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await onAddPaymentMethod({
        type: "bank_account",
        details: {
          name: data.accountName,
          bank_name: data.bankName,
          last4: data.accountNumber.slice(-4)
        }
      });
      
      if (result) {
        bankAccountForm.reset();
        setIsAddDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedMethodId) {
      await onDelete(selectedMethodId);
      setIsDeleteDialogOpen(false);
      setSelectedMethodId(null);
    }
  };

  const getBrandFromCardNumber = (cardNumber: string): string => {
    // Simple check - in real world would use library like card-validator
    if (cardNumber.startsWith("4")) return "Visa";
    if (cardNumber.startsWith("5")) return "Mastercard";
    if (cardNumber.startsWith("34") || cardNumber.startsWith("37")) return "Amex";
    if (cardNumber.startsWith("6")) return "Discover";
    return "Unknown";
  };

  return (
    <div className="space-y-6">
      {paymentMethods.length === 0 ? (
        <div className="p-8 text-center border rounded-lg">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="font-medium">No payment methods</p>
          <p className="text-sm mt-1 mb-4">You haven't added any payment methods yet</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-medium">Your Payment Methods</h3>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
          
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              let icon = CreditCard;
              let title = "";
              let subtitle = "";
              
              if (method.type === "credit_card" || method.type === "debit_card") {
                icon = CreditCard;
                title = `${method.details.brand} •••• ${method.details.last4}`;
                subtitle = `Expires ${method.details.expiry}`;
              } else if (method.type === "paypal") {
                icon = Mail;
                title = "PayPal";
                subtitle = method.details.email || "";
              } else if (method.type === "bank_account") {
                icon = Building;
                title = method.details.bank_name || "Bank Account";
                subtitle = `•••• ${method.details.last4}`;
              }
              
              return (
                <div 
                  key={method.id} 
                  className={`p-4 border rounded-lg flex items-center justify-between ${
                    method.is_default ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      method.is_default ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      {React.createElement(icon, { 
                        className: method.is_default ? "text-blue-600" : "text-gray-600"
                      })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{title}</span>
                        {method.is_default && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetDefault(method.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => {
                        setSelectedMethodId(method.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Add Payment Method Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <FormLabel>Payment Type</FormLabel>
              <Select 
                defaultValue="credit_card" 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedType === "credit_card" && (
              <Form {...creditCardForm}>
                <form onSubmit={creditCardForm.handleSubmit(handleCreditCardSubmit)} className="space-y-4">
                  <FormField
                    control={creditCardForm.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 5678 9012 3456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={creditCardForm.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={creditCardForm.control}
                      name="expiryMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                const value = month.toString().padStart(2, '0');
                                return (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={creditCardForm.control}
                      name="expiryYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="YY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                const shortYear = (year % 100).toString().padStart(2, '0');
                                return (
                                  <SelectItem key={shortYear} value={shortYear}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={creditCardForm.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Card"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
            
            {selectedType === "paypal" && (
              <Form {...paypalForm}>
                <form onSubmit={paypalForm.handleSubmit(handlePaypalSubmit)} className="space-y-4">
                  <FormField
                    control={paypalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PayPal Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add PayPal"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
            
            {selectedType === "bank_account" && (
              <Form {...bankAccountForm}>
                <form onSubmit={bankAccountForm.handleSubmit(handleBankAccountSubmit)} className="space-y-4">
                  <FormField
                    control={bankAccountForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={bankAccountForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank of Canada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={bankAccountForm.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={bankAccountForm.control}
                    name="routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input placeholder="987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Bank Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}