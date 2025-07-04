import { useNotifications } from '@/hooks/use-notifications';
import { renderHook, act } from '@testing-library/react';

// Mock fetch globally
global.fetch = jest.fn();

describe('useNotifications', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (fetch as jest.Mock).mockClear();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockNotificationData = {
    booking_id: 'booking-123',
    user_email: 'tajudeenabdulgafar4@gmail.com',
    admin_email: 'etzteemmytee0@gmail.com',
    booking_details: { service: 'Test Service' },
    payment_details: { amount: 100 },
  };

  describe('sendBookingSubmissionEmails', () => {
    it('should make POST request to booking-submitted endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendBookingSubmissionEmails(mockNotificationData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/emails/booking-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockNotificationData)
      });
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendBookingSubmissionEmails(mockNotificationData);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send booking submission emails:',
        expect.any(Error)
      );
    });
  });

  describe('sendPaymentConfirmation', () => {
    it('should make POST request to payment-success endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendPaymentConfirmation(mockNotificationData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/emails/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockNotificationData)
      });
    });
  });

  describe('sendBookingCancellation', () => {
    it('should make POST request with cancellation data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      const cancellationData = {
        ...mockNotificationData,
        reason: 'Customer request',
        refund_amount: 75
      };

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendBookingCancellation(cancellationData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/emails/booking-cancelled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancellationData)
      });
    });
  });

  describe('sendFinalConfirmation', () => {
    it('should transform data correctly for final confirmation', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      const finalConfirmationData = {
        ...mockNotificationData,
        invoice_url: 'https://example.com/invoice.pdf'
      };

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendFinalConfirmation(finalConfirmationData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/emails/final-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: mockNotificationData.booking_id,
          customer_email: mockNotificationData.user_email,
          booking_details: mockNotificationData.booking_details,
          invoice_url: 'https://example.com/invoice.pdf'
        })
      });
    });
  });

  describe('sendAdminReviewComplete', () => {
    it('should make POST request with admin review data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      
      const adminReviewData = {
        ...mockNotificationData,
        status: 'approved',
        adjustments: 'Added extra service',
        price_change: 25,
        original_price: 100,
        new_price: 125
      };

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.sendAdminReviewComplete(adminReviewData);
      });

      expect(fetch).toHaveBeenCalledWith('/api/emails/admin-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminReviewData)
      });
    });
  });

  describe('error handling', () => {
    it('should log errors for all notification methods', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const networkError = new Error('Network failed');
      (fetch as jest.Mock).mockRejectedValue(networkError);

      const { result } = renderHook(() => useNotifications());

      // Test all methods handle errors
      await act(async () => {
        await result.current.sendBookingSubmissionEmails(mockNotificationData);
        await result.current.sendPaymentConfirmation(mockNotificationData);
        await result.current.sendBookingCancellation({ ...mockNotificationData, reason: 'test' });
        await result.current.sendFinalConfirmation({ ...mockNotificationData, invoice_url: 'test.pdf' });
        await result.current.sendAdminReviewComplete({ ...mockNotificationData, status: 'approved' });
      });

      // Should have logged 5 different error messages
      expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send booking submission emails:', networkError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send payment confirmation:', networkError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send cancellation email:', networkError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send final confirmation:', networkError);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to send admin review email:', networkError);
    });
  });
});