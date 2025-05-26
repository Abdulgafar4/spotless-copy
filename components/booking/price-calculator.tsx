import { Service, PriceBreakdownItem, BookingFormValues } from "./booking-types"

interface CalculatePriceParams {
  formValues: Partial<BookingFormValues>
  services: Service[]
}

interface PriceCalculationResult {
  basePrice: number
  totalPrice: number
  priceBreakdown: PriceBreakdownItem[]
  finalPaymentAmount: number
  originalSubtotal: number // Add this to track original price
}

export function calculatePrice({
  formValues,
  services
}: CalculatePriceParams): PriceCalculationResult {
  const service = services.find(s => s.id || s.name === formValues.service)
  
  if (!service) {
    return {
      basePrice: 0,
      totalPrice: 0,
      priceBreakdown: [],
      finalPaymentAmount: 0,
      originalSubtotal: 0
    }
  }
  
  // Convert service price to number
  const servicePrice = typeof service.price === 'string'
    ? parseFloat(service.price.replace(/[^0-9.-]+/g, ""))
    : service.price
  
  // Initialize price breakdown with base price
  const breakdown: PriceBreakdownItem[] = [
    { item: `Base price (${service.name})`, price: servicePrice }
  ]
  
  // Add price for additional rooms
  const extraPricePerRoom = 20 // $20 per additional room/feature
  
  let additionalCost = 0
  
  if (formValues.bedrooms && formValues.bedrooms > 0) {
    const bedroomsPrice = formValues.bedrooms * extraPricePerRoom
    additionalCost += bedroomsPrice
    breakdown.push({ 
      item: `${formValues.bedrooms} Bedroom${formValues.bedrooms > 1 ? 's' : ''}`, 
      price: bedroomsPrice 
    })
  }
  
  if (formValues.bathrooms && formValues.bathrooms > 0) {
    const bathroomsPrice = formValues.bathrooms * extraPricePerRoom
    additionalCost += bathroomsPrice
    breakdown.push({ 
      item: `${formValues.bathrooms} Bathroom${formValues.bathrooms > 1 ? 's' : ''}`, 
      price: bathroomsPrice 
    })
  }
  
  if (formValues.livingRooms && formValues.livingRooms > 0) {
    const livingRoomsPrice = formValues.livingRooms * extraPricePerRoom
    additionalCost += livingRoomsPrice
    breakdown.push({ 
      item: `${formValues.livingRooms} Living Room${formValues.livingRooms > 1 ? 's' : ''}`, 
      price: livingRoomsPrice 
    })
  }
  
  if (formValues.garages && formValues.garages > 0) {
    const garagesPrice = formValues.garages * extraPricePerRoom
    additionalCost += garagesPrice
    breakdown.push({ 
      item: `${formValues.garages} Garage${formValues.garages > 1 ? 's' : ''}`, 
      price: garagesPrice 
    })
  }
  
  // Add price for den
  if (formValues.den === true) {
    const denPrice = extraPricePerRoom
    additionalCost += denPrice
    breakdown.push({ item: "Den", price: denPrice })
  }
  
  // Calculate original subtotal (this should never change)
  const originalSubtotal = servicePrice + additionalCost
  
  // Calculate final total and payment amount based on payment option
  let finalTotal = originalSubtotal
  let finalPaymentAmount = originalSubtotal
  
  if (formValues.paymentOption === "full") {
    // Apply 5% discount for full payment
    const discount = originalSubtotal * 0.05
    finalTotal = originalSubtotal - discount
    finalPaymentAmount = finalTotal
    breakdown.push({ item: "5% Discount (Pay in Full)", price: -discount })
  } else if (formValues.paymentOption === "deposit") {
    // For deposit: total remains original price, but payment is 70% of original
    finalTotal = originalSubtotal
    finalPaymentAmount = originalSubtotal * 0.7
    // Don't add discount to breakdown for deposit option
  } else {
    // Default case (no payment option selected yet)
    finalTotal = originalSubtotal
    finalPaymentAmount = originalSubtotal
  }
  
  return {
    basePrice: servicePrice,
    totalPrice: finalTotal,
    priceBreakdown: breakdown,
    finalPaymentAmount,
    originalSubtotal
  }
}