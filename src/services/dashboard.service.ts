import type { DashboardStats, ArrivalDeparture } from '@/types'
import { getDb } from './database'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const db = await getDb()

    const totalRows = await db.select<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM spots'
    )
    const activeRows = await db.select<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM spots WHERE is_active = 1'
    )

    const today = new Date().toISOString().slice(0, 10)

    const arrivalRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE check_in = $1 AND status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')",
      [today]
    )
    const departureRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM reservations WHERE check_out = $1 AND status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')",
      [today]
    )

    // Occupancy: active reservations today / active spots
    const occupiedRows = await db.select<{ count: number }[]>(
      "SELECT COUNT(DISTINCT spot_id) as count FROM reservations WHERE check_in <= $1 AND check_out > $1 AND status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')",
      [today]
    )

    const activeSpots = activeRows[0].count
    const occupancyRate = activeSpots > 0
      ? Math.round((occupiedRows[0].count / activeSpots) * 100)
      : 0

    // Monthly revenue (current month)
    const monthStart = today.slice(0, 7) + '-01'
    const revenueRows = await db.select<{ total: number | null }[]>(
      "SELECT SUM(total_price) as total FROM reservations WHERE check_in >= $1 AND status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')",
      [monthStart]
    )

    return {
      totalSpots: totalRows[0].count,
      activeSpots,
      occupancyRate,
      todayArrivals: arrivalRows[0].count,
      todayDepartures: departureRows[0].count,
      monthlyRevenue: revenueRows[0].total ?? 0,
    }
  },

  async getTodayArrivals(): Promise<ArrivalDeparture[]> {
    const db = await getDb()
    const today = new Date().toISOString().slice(0, 10)

    const rows = await db.select<
      { id: string; customer_name: string; spot_name: string; check_in: string; status: string }[]
    >(
      `SELECT r.id, c.first_name || ' ' || c.last_name as customer_name, s.name as spot_name, r.check_in, r.status
       FROM reservations r
       JOIN customers c ON c.id = r.customer_id
       JOIN spots s ON s.id = r.spot_id
       WHERE r.check_in = $1 AND r.status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')
       ORDER BY c.last_name`,
      [today]
    )

    return rows.map((r) => ({
      reservationId: r.id,
      customerName: r.customer_name,
      spotName: r.spot_name,
      date: r.check_in,
      status: r.status,
    }))
  },

  async getTodayDepartures(): Promise<ArrivalDeparture[]> {
    const db = await getDb()
    const today = new Date().toISOString().slice(0, 10)

    const rows = await db.select<
      { id: string; customer_name: string; spot_name: string; check_out: string; status: string }[]
    >(
      `SELECT r.id, c.first_name || ' ' || c.last_name as customer_name, s.name as spot_name, r.check_out, r.status
       FROM reservations r
       JOIN customers c ON c.id = r.customer_id
       JOIN spots s ON s.id = r.spot_id
       WHERE r.check_out = $1 AND r.status NOT IN ('CANCELLED', 'EXPIRED', 'NO_SHOW')
       ORDER BY c.last_name`,
      [today]
    )

    return rows.map((r) => ({
      reservationId: r.id,
      customerName: r.customer_name,
      spotName: r.spot_name,
      date: r.check_out,
      status: r.status,
    }))
  },
}
