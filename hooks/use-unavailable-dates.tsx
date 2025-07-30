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

export const parseUnavailableDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed
  date.setHours(0, 0, 0, 0)
  return date
}

export const formatDateForStorage = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Helper function to calculate recurring dates
const calculateRecurringDates = (unavailableDate: UnavailableDate): string[] => {
  if (!unavailableDate.is_recurring || !unavailableDate.recurring_type) {
    return [unavailableDate.date]
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  
  // FIX: Safe date parsing for the original date
  const [year, month, day] = unavailableDate.date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day) // month is 0-indexed
  
  const endDate = unavailableDate.end_date 
    ? (() => {
        // FIX: Safe parsing for end date too
        const [endYear, endMonth, endDay] = unavailableDate.end_date.split('-').map(Number)
        return new Date(endYear, endMonth - 1, endDay)
      })()
    : new Date(currentYear + 5, 11, 31) // Default 5 years ahead

  const recurringDates: string[] = []

  switch (unavailableDate.recurring_type) {
    case 'yearly':
      for (let year = currentYear; year <= endDate.getFullYear(); year++) {
        const yearlyDate = new Date(year, dateObj.getMonth(), dateObj.getDate())
        if (yearlyDate >= today && yearlyDate <= endDate) {
          // FIX: Format date safely without timezone conversion
          const yyyy = yearlyDate.getFullYear()
          const mm = String(yearlyDate.getMonth() + 1).padStart(2, '0')
          const dd = String(yearlyDate.getDate()).padStart(2, '0')
          recurringDates.push(`${yyyy}-${mm}-${dd}`)
        }
      }
      break

    case 'monthly':
      for (let month = 0; month < 24; month++) { // Next 24 months
        const monthlyDate = new Date(currentYear, today.getMonth() + month, dateObj.getDate())
        if (monthlyDate >= today && monthlyDate <= endDate) {
          // FIX: Format date safely
          const yyyy = monthlyDate.getFullYear()
          const mm = String(monthlyDate.getMonth() + 1).padStart(2, '0')
          const dd = String(monthlyDate.getDate()).padStart(2, '0')
          recurringDates.push(`${yyyy}-${mm}-${dd}`)
        }
      }
      break

    case 'weekly':
      const dayOfWeek = dateObj.getDay()
      for (let week = 0; week < 104; week++) { // Next 2 years
        const weeklyDate = new Date(today)
        weeklyDate.setDate(today.getDate() + (week * 7) + (dayOfWeek - today.getDay()))
        if (weeklyDate >= today && weeklyDate <= endDate) {
          // FIX: Format date safely
          const yyyy = weeklyDate.getFullYear()
          const mm = String(weeklyDate.getMonth() + 1).padStart(2, '0')
          const dd = String(weeklyDate.getDate()).padStart(2, '0')
          recurringDates.push(`${yyyy}-${mm}-${dd}`)
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
      
      // console.log('Fetching unavailable dates from Supabase...')
      
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
        throw new Error(supabaseError.message)
      }
      
      // console.log('Fetched data:', data || 0, 'records')
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
      
      const { data, error: supabaseError } = await supabase
        .from('unavailable_dates')
        .insert([payload])
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      
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
      
      const { data, error: supabaseError } = await supabase
        .from('unavailable_dates')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      
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
      
      
      const { error: supabaseError } = await supabase
        .from('unavailable_dates')
        .delete()
        .eq('id', id)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      
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
        // FIX: Parse date safely to avoid timezone issues
        const [year, month, day] = unavailableDate.date.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day) // month is 0-indexed
        dateObj.setHours(0, 0, 0, 0) // Ensure local midnight
        
        
        
        return dateObj >= today || unavailableDate.is_recurring
      })
      .flatMap(unavailableDate => calculateRecurringDates(unavailableDate))
      .filter((dateString, index, arr) => arr.indexOf(dateString) === index) // Remove duplicates
      .filter(dateString => {
        // FIX: Parse date safely here too
        const [year, month, day] = dateString.split('-').map(Number)
        const dateObj = new Date(year, month - 1, day)
        dateObj.setHours(0, 0, 0, 0)
        return dateObj >= today
      }) // Only future dates
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