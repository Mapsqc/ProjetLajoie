<script setup lang="ts">
import type { DashboardStats } from '@/types'
import StatCard from '@/components/shared/StatCard.vue'
import { MapPin, Percent, ArrowDownToLine, DollarSign } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/format'

defineProps<{
  stats: DashboardStats
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="Emplacements actifs"
      :value="`${stats.activeSpots} / ${stats.totalSpots}`"
      description="Emplacements disponibles"
      :icon="MapPin"
      icon-class="bg-primary/10 text-primary"
    />
    <StatCard
      title="Taux d'occupation"
      :value="`${stats.occupancyRate}%`"
      description="Occupation aujourd'hui"
      :icon="Percent"
      icon-class="bg-amber-50 text-amber-600"
    />
    <StatCard
      title="Arrivees du jour"
      :value="stats.todayArrivals"
      :description="`${stats.todayDepartures} depart(s)`"
      :icon="ArrowDownToLine"
      icon-class="bg-blue-50 text-blue-600"
    />
    <StatCard
      title="Revenus du mois"
      :value="formatCurrency(stats.monthlyRevenue)"
      description="Reservations confirmees"
      :icon="DollarSign"
      icon-class="bg-emerald-50 text-emerald-600"
    />
  </div>
</template>
