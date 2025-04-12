// hooks/use-reports.tsx
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface BranchPerformance {
  branch: string;
  bookings: number;
  revenue: number;
  growth: number;
  customers: number;
  staff: number;
  utilization: number;
}

interface ServiceDistribution {
  name: string;
  value: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface MetricSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  avgRating: number;
}

interface UseReportsReturn {
  revenueData: RevenueData[];
  branchPerformance: BranchPerformance[];
  serviceDistribution: ServiceDistribution[];
  metrics: MetricSummary;
  loading: boolean;
  error: Error | null;
  getRevenueData: (dateRange: string, branch?: string) => Promise<RevenueData[]>;
  getBranchPerformance: () => Promise<BranchPerformance[]>;
  getServiceDistribution: (branch?: string) => Promise<ServiceDistribution[]>;
  getMetricSummary: (dateRange: string) => Promise<MetricSummary>;
}

/**
 * Custom hook for fetching report data for admin dashboard
 */
export const useReports = (): UseReportsReturn => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution[]>([]);
  const [metrics, setMetrics] = useState<MetricSummary>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalBookings: 0,
    bookingsGrowth: 0,
    totalCustomers: 0,
    customerGrowth: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin } = useAuth();

  // Helper function to generate date ranges based on selection
  const getDateRangeFromSelection = (selection: string): DateRange => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (selection) {
      case "today":
        // Just today
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case "this-week":
        // Start of current week to today
        startDate.setDate(today.getDate() - today.getDay()); // Sunday
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case "last-week":
        // Last week
        startDate.setDate(today.getDate() - today.getDay() - 7); // Sunday last week
        endDate.setDate(today.getDate() - today.getDay() - 1); // Saturday last week
        return {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        };
      case "this-month":
        // Start of current month to today
        startDate.setDate(1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case "last-month":
        // Last month
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        endDate.setDate(0); // Last day of previous month
        return {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        };
      case "this-quarter":
        // Start of current quarter to today
        const quarter = Math.floor(today.getMonth() / 3);
        startDate.setMonth(quarter * 3);
        startDate.setDate(1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case "this-year":
        // Start of current year to today
        startDate.setMonth(0);
        startDate.setDate(1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case "all-time":
      default:
        // Last 365 days as fallback
        startDate.setFullYear(today.getFullYear() - 1);
        return {
          start: startDate.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
    }
  };

  // Get revenue data for a specific date range and branch
  const getRevenueData = useCallback(async (dateRange: string, branch?: string): Promise<RevenueData[]> => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      setLoading(true);
      setError(null);
      
      const { start, end } = getDateRangeFromSelection(dateRange);
      
      // Fetch payments data from the database
      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          date,
          booking:bookings(id, branch_id)
        `)
        .gte("date", start)
        .lte("date", end)
        .eq("status", "paid");
      
      // Add branch filter if specified
      if (branch && branch !== "all") {
        query = query.eq("booking.branch_id", branch);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Group data by date
      const groupedByDate = data?.reduce((acc: Record<string, { revenue: number, bookings: number }>, payment) => {
        const dateKey = new Date(payment.date).toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = { revenue: 0, bookings: 0 };
        }
        
        acc[dateKey].revenue += payment.amount || 0;
        acc[dateKey].bookings += 1;
        
        return acc;
      }, {});
      
      // Convert grouped data to array format for chart
      const resultData = Object.entries(groupedByDate || {}).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(data.revenue.toFixed(2)),
        bookings: data.bookings
      }));
      
      // Sort by date
      resultData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setRevenueData(resultData);
      return resultData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(new Error(errorMessage));
      console.error("Failed to fetch revenue data:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Get performance metrics for all branches
  const getBranchPerformance = useCallback(async (): Promise<BranchPerformance[]> => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch branches first
      const { data: branchesData, error: branchesError } = await supabase
        .from("branches")
        .select("*");
      
      if (branchesError) {
        throw branchesError;
      }
      
      // For each branch, gather metrics
      const branchResults = await Promise.all(
        branchesData.map(async (branch) => {
          // Get current month bookings
          const currentMonth = new Date();
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
          
          const { data: currentBookings, error: currentError } = await supabase
            .from("bookings")
            .select("id, total_amount")
            .eq("branch_id", branch.id)
            .gte("date", startOfMonth);
          
          if (currentError) {
            console.error(`Error fetching current bookings for branch ${branch.id}:`, currentError);
          }
          
          // Get previous month bookings for growth calculation
          const prevMonth = new Date();
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          const startOfPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0];
          const endOfPrevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).toISOString().split('T')[0];
          
          const { data: prevBookings, error: prevError } = await supabase
            .from("bookings")
            .select("id, total_amount")
            .eq("branch_id", branch.id)
            .gte("date", startOfPrevMonth)
            .lte("date", endOfPrevMonth);
          
          if (prevError) {
            console.error(`Error fetching previous bookings for branch ${branch.id}:`, prevError);
          }
          
          // Get unique customers for this branch
          const { data: customers, error: customerError } = await supabase
            .from("bookings")
            .select("user_id")
            .eq("branch_id", branch.id)
            .gte("date", startOfMonth);
          
          if (customerError) {
            console.error(`Error fetching customers for branch ${branch.id}:`, customerError);
          }
          
          // Get staff count for this branch
          const { data: staff, error: staffError } = await supabase
            .from("employees")
            .select("id")
            .eq("branch_id", branch.id);
          
          if (staffError) {
            console.error(`Error fetching staff for branch ${branch.id}:`, staffError);
          }
          
          // Calculate metrics
          const currentRevenue = currentBookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
          const prevRevenue = prevBookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
          
          // Calculate growth rate
          const growth = prevRevenue > 0 
            ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) 
            : 0;
          
          // Calculate utilization rate (simple approximation)
          const staffCount = staff?.length || 1;
          const bookingsCount = currentBookings?.length || 0;
          const utilization = Math.min(Math.round((bookingsCount / (staffCount * 20)) * 100), 100); // Assuming 20 bookings per staff is 100%
          
          // Get unique customer count
          const uniqueCustomers = new Set(customers?.map(c => c.user_id)).size;
          
          return {
            branch: branch.name,
            bookings: currentBookings?.length || 0,
            revenue: currentRevenue,
            growth: growth,
            customers: uniqueCustomers,
            staff: staffCount,
            utilization: utilization
          };
        })
      );
      
      setBranchPerformance(branchResults);
      return branchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(new Error(errorMessage));
      console.error("Failed to fetch branch performance data:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Get service distribution data
  const getServiceDistribution = useCallback(async (branch?: string): Promise<ServiceDistribution[]> => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Query to get bookings grouped by service type
      let query = supabase
        .from("bookings")
        .select("service_type, id");
      
      // Add branch filter if specified
      if (branch && branch !== "all") {
        query = query.eq("branch_id", branch);
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Group and count by service type
      const serviceGroups: Record<string, number> = {};
      
      data?.forEach(booking => {
        const serviceType = booking.service_type || "Other";
        if (!serviceGroups[serviceType]) {
          serviceGroups[serviceType] = 0;
        }
        serviceGroups[serviceType] += 1;
      });
      
      // Calculate percentages
      const totalCount = Object.values(serviceGroups).reduce((sum, count) => sum + count, 0);
      
      const result = Object.entries(serviceGroups).map(([name, count]) => ({
        name,
        value: Math.round((count / totalCount) * 100)
      }));
      
      // Sort by value descending
      result.sort((a, b) => b.value - a.value);
      
      setServiceDistribution(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(new Error(errorMessage));
      console.error("Failed to fetch service distribution data:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Get summary metrics
  const getMetricSummary = useCallback(async (dateRange: string): Promise<MetricSummary> => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      setLoading(true);
      setError(null);
      
      const { start, end } = getDateRangeFromSelection(dateRange);
      
      // For comparison, we need the previous period of equal length
      const days = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - days);
      
      // Get current period revenue and bookings
      const { data: currentPayments, error: currentPaymentsError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .gte("date", start)
        .lte("date", end);
      
      if (currentPaymentsError) {
        throw currentPaymentsError;
      }
      
      const { data: currentBookings, error: currentBookingsError } = await supabase
        .from("bookings")
        .select("id, user_id")
        .gte("date", start)
        .lte("date", end);
      
      if (currentBookingsError) {
        throw currentBookingsError;
      }
      
      // Get previous period data
      const { data: prevPayments, error: prevPaymentsError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .gte("date", prevStart.toISOString().split('T')[0])
        .lte("date", prevEnd.toISOString().split('T')[0]);
      
      if (prevPaymentsError) {
        throw prevPaymentsError;
      }
      
      const { data: prevBookings, error: prevBookingsError } = await supabase
        .from("bookings")
        .select("id, user_id")
        .gte("date", prevStart.toISOString().split('T')[0])
        .lte("date", prevEnd.toISOString().split('T')[0]);
      
      if (prevBookingsError) {
        throw prevBookingsError;
      }
      
      // Get reviews for average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("rating")
        .gte("created_at", start)
        .lte("created_at", end);
      
      if (reviewsError) {
        throw reviewsError;
      }
      
      // Calculate metrics
      const totalRevenue = currentPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const prevRevenue = prevPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      
      const revenueGrowth = prevRevenue > 0 
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) 
        : 0;
      
      const totalBookings = currentBookings?.length || 0;
      const prevTotalBookings = prevBookings?.length || 0;
      
      const bookingsGrowth = prevTotalBookings > 0 
        ? Math.round(((totalBookings - prevTotalBookings) / prevTotalBookings) * 100) 
        : 0;
      
      // Unique customers
      const uniqueCustomers = new Set(currentBookings?.map(b => b.user_id)).size;
      const prevUniqueCustomers = new Set(prevBookings?.map(b => b.user_id)).size;
      
      const customerGrowth = prevUniqueCustomers > 0 
        ? Math.round(((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100) 
        : 0;
      
      // Average rating
      const avgRating = reviews && reviews.length > 0
        ? parseFloat((reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1))
        : 0;
      
      const summaryData = {
        totalRevenue,
        revenueGrowth,
        totalBookings,
        bookingsGrowth,
        totalCustomers: uniqueCustomers,
        customerGrowth,
        avgRating
      };
      
      setMetrics(summaryData);
      return summaryData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(new Error(errorMessage));
      console.error("Failed to fetch metric summary data:", err);
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        totalBookings: 0,
        bookingsGrowth: 0,
        totalCustomers: 0,
        customerGrowth: 0,
        avgRating: 0
      };
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initialize with default values on component mount
  useEffect(() => {
    if (isAdmin) {
      const initData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            getRevenueData("this-month"),
            getBranchPerformance(),
            getServiceDistribution(),
            getMetricSummary("this-month")
          ]);
        } catch (err) {
          console.error("Error initializing report data:", err);
        } finally {
          setLoading(false);
        }
      };
      
      initData();
    }
  }, [isAdmin, getRevenueData, getBranchPerformance, getServiceDistribution, getMetricSummary]);

  return {
    revenueData,
    branchPerformance,
    serviceDistribution,
    metrics,
    loading,
    error,
    getRevenueData,
    getBranchPerformance,
    getServiceDistribution,
    getMetricSummary,
  };
};