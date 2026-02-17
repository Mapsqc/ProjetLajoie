import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FiscalSummary } from '@/types'
import { fiscalService } from '@/services/fiscal.service'

export const useFiscalStore = defineStore('fiscal', () => {
  const summary = ref<FiscalSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentYear = ref(new Date().getFullYear())
  const currentMonth = ref(new Date().getMonth())

  async function fetchSummary(year: number, month: number) {
    isLoading.value = true
    error.value = null
    try {
      summary.value = await fiscalService.getMonthlySummary(year, month)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
    } finally {
      isLoading.value = false
    }
  }

  function prevMonth() {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
    fetchSummary(currentYear.value, currentMonth.value)
  }

  function nextMonth() {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
    fetchSummary(currentYear.value, currentMonth.value)
  }

  function goToToday() {
    currentYear.value = new Date().getFullYear()
    currentMonth.value = new Date().getMonth()
    fetchSummary(currentYear.value, currentMonth.value)
  }

  return { summary, isLoading, error, currentYear, currentMonth, fetchSummary, prevMonth, nextMonth, goToToday }
})
