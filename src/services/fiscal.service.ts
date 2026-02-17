import type { FiscalSummary } from '@/types'
import { getDb } from './database'

export const fiscalService = {
  async getMonthlySummary(year: number, month: number): Promise<FiscalSummary> {
    const db = await getDb()

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`

    const rows = await db.select<{ totalRevenue: number | null; reservationCount: number }[]>(
      `SELECT SUM(total_price) as totalRevenue, COUNT(*) as reservationCount
       FROM reservations
       WHERE check_in >= $1 AND check_in < $2
         AND status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')`,
      [startDate, endDate],
    )

    return {
      totalRevenue: rows[0].totalRevenue ?? 0,
      reservationCount: rows[0].reservationCount,
      month,
      year,
    }
  },
}
