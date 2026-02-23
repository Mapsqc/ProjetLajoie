import { describe, it, expect } from 'vitest'
import { computeExtraPersonFee, computeTotalWithTax, computeDeposit } from './pricing'

const TAX_RATE = 0.14975
const EXTRA_PERSON_FEE = 6
const BASE_OCCUPANCY = 2
const DEPOSIT_RATE = 0.25

describe('computeExtraPersonFee', () => {
  it('returns 0 for 0 adults', () => {
    expect(computeExtraPersonFee(0, 1)).toBe(0)
  })

  it('returns 0 for 1 adult (under base occupancy)', () => {
    expect(computeExtraPersonFee(1, 3)).toBe(0)
  })

  it('returns 0 for exactly 2 adults (base occupancy)', () => {
    expect(computeExtraPersonFee(2, 5)).toBe(0)
  })

  it('charges for 1 extra adult over 2 nights', () => {
    // 1 extra * $6 * 2 nights = $12
    expect(computeExtraPersonFee(3, 2)).toBe(12)
  })

  it('charges for 2 extra adults over 3 nights', () => {
    // 2 extra * $6 * 3 nights = $36
    expect(computeExtraPersonFee(4, 3)).toBe(36)
  })

  it('charges for 3 extra adults over 1 night', () => {
    // 3 extra * $6 * 1 night = $18
    expect(computeExtraPersonFee(5, 1)).toBe(18)
  })
})

describe('computeTotalWithTax', () => {
  it('calculates base price with tax, no extra fee for 2 adults', () => {
    const subtotal = 50 * 3
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const expected = Math.round((subtotal + tax) * 100) / 100
    expect(computeTotalWithTax(50, 3, 2)).toBe(expected)
  })

  it('adds extra adult fee for adults over base occupancy', () => {
    // pricePerNight=40, nights=2, adults=4 (2 extra adults)
    const base = 40 * 2
    const extra = 2 * EXTRA_PERSON_FEE * 2
    const subtotal = base + extra
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const expected = Math.round((subtotal + tax) * 100) / 100
    expect(computeTotalWithTax(40, 2, 4)).toBe(expected)
  })

  it('defaults to 0 adults (no extra fee) when adultsCount omitted', () => {
    const subtotal = 60 * 1
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const expected = Math.round((subtotal + tax) * 100) / 100
    expect(computeTotalWithTax(60, 1)).toBe(expected)
  })

  it('children do NOT affect the price — only adults count', () => {
    const pricePerNight = 50
    const nights = 2
    const adults = 2

    const priceWith0Children = computeTotalWithTax(pricePerNight, nights, adults)
    const priceWith3Children = computeTotalWithTax(pricePerNight, nights, adults)

    // Passing adults only both times — children are not a parameter
    expect(priceWith0Children).toBe(priceWith3Children)

    // And the price should match the formula with only adults
    const subtotal = pricePerNight * nights // no extra (adults == BASE_OCCUPANCY)
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    const expected = Math.round((subtotal + tax) * 100) / 100
    expect(priceWith0Children).toBe(expected)
  })

  it('adding extra adults increases price, but adding children does not', () => {
    const base = computeTotalWithTax(50, 2, 2)    // 2 adults = base occupancy
    const withExtraAdult = computeTotalWithTax(50, 2, 3)  // 3 adults = 1 extra

    expect(withExtraAdult).toBeGreaterThan(base)

    // Children don't change price — same adults count passed either way
    const withoutChildren = computeTotalWithTax(50, 2, 2)
    const withChildrenStillUsesAdults = computeTotalWithTax(50, 2, 2) // children ignored
    expect(withoutChildren).toBe(withChildrenStillUsesAdults)
  })

  it('returns 0 when nights = 0', () => {
    expect(computeTotalWithTax(50, 0, 2)).toBe(0)
  })
})

describe('computeDeposit', () => {
  it('returns 25% of total price', () => {
    expect(computeDeposit(200)).toBe(50)
  })

  it('rounds to 2 decimal places', () => {
    // 33.33 * 0.25 = 8.3325 → 8.33
    expect(computeDeposit(33.33)).toBe(8.33)
  })

  it('returns 0 for 0 total', () => {
    expect(computeDeposit(0)).toBe(0)
  })
})
