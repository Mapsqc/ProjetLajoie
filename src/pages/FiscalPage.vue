<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFiscalStore } from '@/stores/fiscal.store'
import { getMonthLabel } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { generateFiscalPdf } from '@/utils/pdf'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import StatCard from '@/components/shared/StatCard.vue'
import { Button } from '@/components/ui/button'
import { DollarSign, BookOpen, ChevronLeft, ChevronRight, FileDown } from 'lucide-vue-next'

const store = useFiscalStore()

const monthLabel = computed(() => getMonthLabel(store.currentYear, store.currentMonth))

async function exportPdf() {
  if (store.summary) {
    await generateFiscalPdf(store.summary, monthLabel.value)
  }
}

onMounted(() => {
  store.fetchSummary(store.currentYear, store.currentMonth)
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Fiscalité" description="Revenus et statistiques mensuelles" />

    <!-- Month navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button variant="outline" size="icon" class="h-8 w-8" @click="store.prevMonth()">
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" class="h-8 text-xs" @click="store.goToToday()">
          Aujourd'hui
        </Button>
        <span class="min-w-[150px] text-center text-sm font-medium capitalize">
          {{ monthLabel }}
        </span>
        <Button variant="outline" size="icon" class="h-8 w-8" @click="store.nextMonth()">
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>

      <Button size="sm" @click="exportPdf" :disabled="!store.summary || store.isLoading">
        <FileDown class="mr-2 h-4 w-4" />
        Exporter PDF
      </Button>
    </div>

    <LoadingSpinner v-if="store.isLoading" />

    <template v-else-if="store.summary">
      <div class="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Revenus du mois"
          :value="formatCurrency(store.summary.totalRevenue)"
          description="Total des réservations confirmées"
          :icon="DollarSign"
          icon-class="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Réservations"
          :value="store.summary.reservationCount"
          description="Nombre de réservations du mois"
          :icon="BookOpen"
          icon-class="bg-blue-50 text-blue-600"
        />
      </div>
    </template>

    <div v-else-if="store.error" class="rounded-md bg-destructive/10 p-4 text-destructive">
      {{ store.error }}
    </div>
  </div>
</template>
