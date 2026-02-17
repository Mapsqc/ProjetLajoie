import { z } from 'zod'

export const DashboardStatsSchema = z.object({
  activeSpots: z.number(),
  totalSpots: z.number(),
  occupancyRate: z.number(),
  todayArrivals: z.number(),
  todayDepartures: z.number(),
  monthlyRevenue: z.number(),
})

export type DashboardStats = z.infer<typeof DashboardStatsSchema>

export interface ArrivalDeparture {
  reservationId: string
  customerName: string
  spotName: string
  date: string
  status: string
}
