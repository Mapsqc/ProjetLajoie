<script setup lang="ts">
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard.store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import StatsGrid from '@/features/dashboard/StatsGrid.vue'
import ArrivalsWidget from '@/features/dashboard/ArrivalsWidget.vue'
import DeparturesWidget from '@/features/dashboard/DeparturesWidget.vue'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchAll()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Tableau de bord" description="Vue d'ensemble du camping" />

    <LoadingSpinner v-if="dashboardStore.isLoading" />

    <template v-else-if="dashboardStore.stats">
      <StatsGrid :stats="dashboardStore.stats" />

      <div class="grid gap-6 md:grid-cols-2">
        <ArrivalsWidget :arrivals="dashboardStore.todayArrivals" />
        <DeparturesWidget :departures="dashboardStore.todayDepartures" />
      </div>
    </template>

    <div v-else-if="dashboardStore.error" class="rounded-md bg-destructive/10 p-4 text-destructive">
      {{ dashboardStore.error }}
    </div>
  </div>
</template>
