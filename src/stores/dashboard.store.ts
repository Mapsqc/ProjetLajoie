import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardStats, ArrivalDeparture } from '@/types'
import { dashboardService } from '@/services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const todayArrivals = ref<ArrivalDeparture[]>([])
  const todayDepartures = ref<ArrivalDeparture[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const [s, a, d] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTodayArrivals(),
        dashboardService.getTodayDepartures(),
      ])
      stats.value = s
      todayArrivals.value = a
      todayDepartures.value = d
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
    } finally {
      isLoading.value = false
    }
  }

  return { stats, todayArrivals, todayDepartures, isLoading, error, fetchAll }
})
