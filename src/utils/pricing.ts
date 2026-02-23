const TAX_RATE = 0.14975
const DEPOSIT_RATE = 0.25
const BASE_OCCUPANCY = 2
const EXTRA_PERSON_FEE = 6

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
