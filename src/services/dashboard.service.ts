import type { DashboardStats, ArrivalDeparture } from '@/types'
import { apiGet } from './api-client'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>('/api/admin/dashboard/stats')
  },

  async getTodayArrivals(): Promise<ArrivalDeparture[]> {
    return apiGet<ArrivalDeparture[]>('/api/admin/dashboard/arrivals')
  },

  async getTodayDepartures(): Promise<ArrivalDeparture[]> {
    return apiGet<ArrivalDeparture[]>('/api/admin/dashboard/departures')
  },
}
