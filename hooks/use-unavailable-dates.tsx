import { useState, useCallback, useEffect } from 'react'
import { UnavailableDate, UnavailableDateFormValues } from '@/model/unavailable-date-schema'
import { supabase } from "@/lib/supabaseClient";



interface UseUnavailableDatesReturn {
  unavailableDates: UnavailableDate[]
  loading: boolean
  error: string | null
  fetchUnavailableDates: () => Promise<void>
  createUnavailableDate: (dateData: UnavailableDateFormValues) => Promise<void>
  updateUnavailableDate: (id: number, dateData: UnavailableDateFormValues) => Promise<void>
  deleteUnavailableDate: (id: number) => Promise<void>
  getUnavailableDatesForBranch: (branch?: string) => string[]
  clearError: () => void
  refreshData: () => Promise<void>
}

// Helper function to format date data for Supabase
const formatDateData = (dateData: UnavailableDateFormValues) => ({
  date: dateData.date.toISOString().split('T')[0],
  reason: dateData.reason.trim(),
  branch: dateData.branch,
  is_recurring: dateData.is_recurring || false,
  recurring_type: dateData.recurring_type || null,
  end_date: dateData.end_date?.toISOString().split('T')[0] || null,
})

// Helper function to calculate recurring dates
const calculateRecurringDates = (unavailableDate: UnavailableDate): string[] => {
  if (!unavailableDate.is_recurring || !unavailableDate.recurring_type) {
    return [unavailableDate.date]
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const dateObj = new Date(unavailableDate.date)
  const endDate = unavailableDate.end_date 
    ? new Date(unavailableDate.end_date) 
    : new Date(currentYear + 5, 11, 31) // Default 5 years ahead

  const recurringDates: string[] = []

  switch (unavailableDate.recurring_type) {
    case 'yearly':
      for (let year = currentYear; year <= endDate.getFullYear(); year++) {
        const yearlyDate = new Date(year, dateObj.getMonth(), dateObj.getDate())
        if (yearlyDate >= today && yearlyDate <= endDate) {
          recurringDates.push(yearlyDate.toISOString().split('T')[0])
        }
      }
      break

    case 'monthly':
      for (let month = 0; month < 24; month++) { // Next 24 months
        const monthlyDate = new Date(currentYear, today.getMonth() + month, dateObj.getDate())
        if (monthlyDate >= today && monthlyDate <= endDate) {
          recurringDates.push(monthlyDate.toISOString().split('T')[0])
        }
      }
      break

    case 'weekly':
      const dayOfWeek = dateObj.getDay()
      for (let week = 0; week < 104; week++) { // Next 2 years
        const weeklyDate = new Date(today)
        weeklyDate.setDate(today.getDate() + (week * 7) + (dayOfWeek - today.getDay()))
        if (weeklyDate >= today && weeklyDate <= endDate) {
          recurringDates.push(weeklyDate.toISOString().split('T')[0])
        }
      }
      break
  }

  return recurringDates
}

export function useUnavailableDates(): UseUnavailableDatesReturn {
  // State management
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to handle errors
  const handleError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
    const fullError = `${context}: ${errorMessage}`
    
    setError(fullError)
    console.error(fullError, err)
    
    return fullError
  }, [])

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch all unavailable dates
  const fetchUnavailableDates = useCallback(async (branch?: string) => {
    try {
      setLoading(true)
      clearError()
      
      console.log('Fetching unavailable dates from Supabase...')
      
      let query = supabase
        .from('unavailable_dates')
        .select('*')
        .order('date', { ascending: true })
      
      // Filter by branch if specified
      if (branch && branch !== 'all' && branch !== 'All') {
        query = query.or(`branch.eq.All Branches,branch.ilike.%${branch}%`)
      }
      
      const { data, error: supabaseError } = await query
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }
      
      console.log('Fetched data:', data?.length || 0, 'records')
      setUnavailableDates(data || [])
    } catch (err) {
      handleError(err, 'Failed to fetch unavailable dates')
    } finally {
      setLoading(false)
    }
  }, [clearError, handleError])

  // Create a new unavailable date
  const createUnavailableDate = useCallback(async (dateData: UnavailableDateFormValues) => {
    try {
      setLoading(true)
      clearError()
      
      const payload = formatDateData(dateData)
      console.log('Creating unavailable date:', payload)
      
      const { data, error: supabaseError } = await supabase
        .from('unavailable_dates')
        .insert([payload])
        .select()
        .single()
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }
      
      console.log('Created successfully:', data)
      
      // Optimistically update local state
      if (data) {
        setUnavailableDates(prev => [...prev, data].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
      }
    } catch (err) {
      const errorMsg = handleError(err, 'Failed to create unavailable date')
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [clearError, handleError])

  // Update an existing unavailable date
  const updateUnavailableDate = useCallback(async (id: number, dateData: UnavailableDateFormValues) => {
    try {
      setLoading(true)
      clearError()
      
      const payload = formatDateData(dateData)
      console.log('Updating unavailable date:', id, payload)
      
      const { data, error: supabaseError } = await supabase
        .from('unavailable_dates')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }
      
      console.log('Updated successfully:', data)
      
      // Optimistically update local state
      if (data) {
        setUnavailableDates(prev => prev.map(date => 
          date.id === id ? data : date
        ).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
      }
    } catch (err) {
      const errorMsg = handleError(err, 'Failed to update unavailable date')
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [clearError, handleError])

  // Delete an unavailable date
  const deleteUnavailableDate = useCallback(async (id: number) => {
    try {
      setLoading(true)
      clearError()
      
      console.log('Deleting unavailable date:', id)
      
      const { error: supabaseError } = await supabase
        .from('unavailable_dates')
        .delete()
        .eq('id', id)
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message)
      }
      
      console.log('Deleted successfully')
      
      // Optimistically update local state
      setUnavailableDates(prev => prev.filter(date => date.id !== id))
    } catch (err) {
      const errorMsg = handleError(err, 'Failed to delete unavailable date')
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [clearError, handleError])

  // Get unavailable dates for a specific branch (includes recurring logic)
  const getUnavailableDatesForBranch = useCallback((branch?: string): string[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return unavailableDates
      .filter(unavailableDate => {
        // Filter by branch
        if (branch) {
          const branchMatches = 
            unavailableDate.branch === "All Branches" || 
            unavailableDate.branch.toLowerCase() === branch.toLowerCase()
          
          if (!branchMatches) return false
        }

        // Only include future dates or recurring dates
        const dateObj = new Date(unavailableDate.date)
        return dateObj >= today || unavailableDate.is_recurring
      })
      .flatMap(unavailableDate => calculateRecurringDates(unavailableDate))
      .filter((dateString, index, arr) => arr.indexOf(dateString) === index) // Remove duplicates
      .filter(dateString => new Date(dateString) >= today) // Only future dates
      .sort()
  }, [unavailableDates])

  // Refresh data (alias for fetchUnavailableDates)
  const refreshData = useCallback(async () => {
    await fetchUnavailableDates()
  }, [fetchUnavailableDates])

  // Auto-fetch on mount
  useEffect(() => {
    fetchUnavailableDates()
  }, [fetchUnavailableDates])

  return {
    unavailableDates,
    loading,
    error,
    fetchUnavailableDates,
    createUnavailableDate,
    updateUnavailableDate,
    deleteUnavailableDate,
    getUnavailableDatesForBranch,
    clearError,
    refreshData,
  }
}