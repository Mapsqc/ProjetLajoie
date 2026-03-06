export const TAX_RATE = 0.14975
export const DEPOSIT_RATE = 0.25
export const BASE_OCCUPANCY = 2
export const EXTRA_PERSON_FEE = 6

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function computeExtraPersonFee(adultsCount: number, nights: number): number {
  const extra = Math.max(0, adultsCount - BASE_OCCUPANCY)
  return roundCurrency(extra * EXTRA_PERSON_FEE * nights)
}

export function computeTotalWithTax(pricePerNight: number, nights: number, adultsCount: number = 0): number {
  const baseSubtotal = roundCurrency(pricePerNight * nights)
  const extraFee = computeExtraPersonFee(adultsCount, nights)
  const subtotal = roundCurrency(baseSubtotal + extraFee)
  const taxAmount = roundCurrency(subtotal * TAX_RATE)
  return roundCurrency(subtotal + taxAmount)
}

export function computeDeposit(totalPrice: number): number {
  return roundCurrency(totalPrice * DEPOSIT_RATE)
}

export interface PriceBreakdown {
  baseSubtotal: number
  extraPersonFee: number
  subtotal: number
  taxAmount: number
  total: number
}

export function computePriceBreakdown(pricePerNight: number, nights: number, adultsCount: number = 0): PriceBreakdown {
  const baseSubtotal = roundCurrency(pricePerNight * nights)
  const extraPersonFee = computeExtraPersonFee(adultsCount, nights)
  const subtotal = roundCurrency(baseSubtotal + extraPersonFee)
  const taxAmount = roundCurrency(subtotal * TAX_RATE)
  const total = roundCurrency(subtotal + taxAmount)
  return { baseSubtotal, extraPersonFee, subtotal, taxAmount, total }
}
