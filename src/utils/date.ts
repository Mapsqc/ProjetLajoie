import dayjs from 'dayjs'
import 'dayjs/locale/fr-ca'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.locale('fr-ca')

export function formatDate(date: string | Date): string {
  return dayjs(date).format('D MMMM YYYY')
}

export function formatDateShort(date: string | Date): string {
  return dayjs(date).format('D MMM YYYY')
}

export function formatDateCompact(date: string | Date): string {
  return dayjs(date).format('DD/MM/YY')
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  return dayjs(end).diff(dayjs(start), 'day')
}

export function isToday(date: string | Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day')
}

export function getDaysInMonth(year: number, month: number): number {
  return dayjs().year(year).month(month).daysInMonth()
}

export function getMonthLabel(year: number, month: number): string {
  return dayjs().year(year).month(month).format('MMMM YYYY')
}

const MONTH_NAMES: Record<string, number> = {
  janvier: 0, janv: 0, jan: 0,
  février: 1, fevrier: 1, fév: 1, fev: 1,
  mars: 2, mar: 2,
  avril: 3, avr: 3,
  mai: 4,
  juin: 5,
  juillet: 6, juil: 6,
  août: 7, aout: 7, aoû: 7,
  septembre: 8, sept: 8, sep: 8,
  octobre: 9, oct: 9,
  novembre: 10, nov: 10,
  décembre: 11, decembre: 11, déc: 11, dec: 11,
}

/**
 * Try to parse a French date string like "11 février", "11 fév 2025", "11 février 2025"
 * Returns ISO date string (YYYY-MM-DD) or null if not a recognizable date.
 */
export function parseFrenchDate(input: string): string | null {
  const trimmed = input.trim().toLowerCase().replace(/\./g, '')
  const match = trimmed.match(/^(\d{1,2})\s+([a-zàâäéèêëïîôùûüç]+)(?:\s+(\d{4}))?$/)
  if (!match) return null

  const day = parseInt(match[1], 10)
  const monthStr = match[2]
  const year = match[3] ? parseInt(match[3], 10) : dayjs().year()

  const month = MONTH_NAMES[monthStr]
  if (month === undefined) return null
  if (day < 1 || day > 31) return null

  const d = dayjs().year(year).month(month).date(day)
  if (!d.isValid()) return null

  return d.format('YYYY-MM-DD')
}

export { dayjs }
