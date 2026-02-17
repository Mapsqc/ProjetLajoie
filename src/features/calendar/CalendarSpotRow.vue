<script setup lang="ts">
import type { Spot, Reservation } from '@/types'
import CalendarDayCell from './CalendarDayCell.vue'

defineProps<{
  spot: Spot
  days: { date: string; label: string; isToday: boolean }[]
  reservations: Reservation[]
}>()

function getReservationForDay(date: string, reservations: Reservation[]): Reservation | null {
  return reservations.find(
    (r) =>
      (r.status === 'CONFIRMED' || r.status === 'HOLD') &&
      date >= r.checkIn &&
      date < r.checkOut
  ) || null
}
</script>

<template>
  <div class="flex border-b last:border-b-0 hover:bg-muted/20">
    <div class="w-32 shrink-0 border-r px-3 py-2 text-xs font-medium truncate" :title="spot.name">
      {{ spot.name }}
    </div>
    <CalendarDayCell
      v-for="day in days"
      :key="day.date"
      :date="day.date"
      :is-today="day.isToday"
      :reservation="getReservationForDay(day.date, reservations)"
    />
  </div>
</template>
