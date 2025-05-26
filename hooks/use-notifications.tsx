"use client";

import { useCallback } from "react";

export interface NotificationData {
  booking_id: string;
  user_email?: string;
  admin_email?: string;
  booking_details?: any;
  payment_details?: any;
  customer_email?: string;
}

export const useNotifications = () => {
  
  const sendBookingSubmissionEmails = useCallback(async (data: NotificationData) => {
    try {
      await fetch('/api/emails/booking-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send booking submission emails:', error);
    }
  }, []);

  const sendPaymentConfirmation = useCallback(async (data: NotificationData) => {
    try {
      await fetch('/api/emails/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
    }
  }, []);

  const sendBookingCancellation = useCallback(async (data: NotificationData & { reason?: string; refund_amount?: number }) => {
    try {
      await fetch('/api/emails/booking-cancelled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  }, []);

 const sendFinalConfirmation = useCallback(async (data: NotificationData & { invoice_url?: string }) => {
    try {
      await fetch('/api/emails/final-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: data.booking_id,
          customer_email: data.user_email,
          booking_details: data.booking_details,
          invoice_url: data.invoice_url
        })
      });
    } catch (error) {
      console.error('Failed to send final confirmation:', error);
    }
  }, []);

    const sendAdminReviewComplete = useCallback(async (data: NotificationData & { 
    status: string; 
    adjustments?: string; 
    price_change?: number;
    original_price?: number;
    new_price?: number;
  }) => {
    try {
      await fetch('/api/emails/admin-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send admin review email:', error);
    }
  }, []);

  return {
    sendBookingSubmissionEmails,
    sendPaymentConfirmation,
    sendBookingCancellation,
    sendFinalConfirmation,
    sendAdminReviewComplete
  };
};
