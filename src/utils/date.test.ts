import { describe, it, expect } from 'vitest'
import { parseFrenchDate } from './date'

describe('parseFrenchDate', () => {
  it('parses "11 février" to current year ISO date', () => {
    const result = parseFrenchDate('11 février')
    const year = new Date().getFullYear()
    expect(result).toBe(`${year}-02-11`)
  })

  it('parses "1 janvier 2025" with explicit year', () => {
    expect(parseFrenchDate('1 janvier 2025')).toBe('2025-01-01')
  })

  it('parses "3 mars"', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('3 mars')).toBe(`${year}-03-03`)
  })

  it('parses "15 août"', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('15 août')).toBe(`${year}-08-15`)
  })

  it('parses "25 décembre"', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('25 décembre')).toBe(`${year}-12-25`)
  })

  it('parses abbreviated months like "11 fév"', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('11 fév')).toBe(`${year}-02-11`)
  })

  it('parses without accents "11 fevrier"', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('11 fevrier')).toBe(`${year}-02-11`)
  })

  it('handles leading/trailing spaces', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('  11 février  ')).toBe(`${year}-02-11`)
  })

  it('returns null for non-date strings', () => {
    expect(parseFrenchDate('Jean Dupont')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseFrenchDate('')).toBeNull()
  })

  it('returns null for just a number', () => {
    expect(parseFrenchDate('11')).toBeNull()
  })

  it('returns null for invalid month', () => {
    expect(parseFrenchDate('11 flurp')).toBeNull()
  })

  it('pads single digit day and month', () => {
    const year = new Date().getFullYear()
    expect(parseFrenchDate('5 mai')).toBe(`${year}-05-05`)
  })
})
