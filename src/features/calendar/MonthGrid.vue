<script setup lang="ts">
import { computed } from 'vue'
import type { Spot, Reservation } from '@/types'
import { getDaysInMonth, dayjs } from '@/utils/date'
import CalendarSpotRow from './CalendarSpotRow.vue'

const props = defineProps<{
  year: number
  month: number
  spots: Spot[]
  reservations: Reservation[]
}>()

const daysInMonth = computed(() => getDaysInMonth(props.year, props.month))

const dayHeaders = computed(() => {
  const days: { date: string; label: string; isToday: boolean }[] = []
  for (let d = 1; d <= daysInMonth.value; d++) {
    const date = dayjs().year(props.year).month(props.month).date(d)
    days.push({
      date: date.format('YYYY-MM-DD'),
      label: String(d),
      isToday: date.isSame(dayjs(), 'day'),
    })
  }
  return days
})
</script>

<template>
  <div class="overflow-auto rounded-md border">
    <div class="min-w-[900px]">
      <!-- Header row -->
      <div class="flex border-b bg-muted/50">
        <div class="w-32 shrink-0 border-r px-3 py-2 text-xs font-medium text-muted-foreground">
          Emplacement
        </div>
        <div
          v-for="day in dayHeaders"
          :key="day.date"
          class="flex-1 border-r px-1 py-2 text-center text-xs"
          :class="day.isToday ? 'bg-primary/10 font-bold text-primary' : 'text-muted-foreground'"
        >
          {{ day.label }}
        </div>
      </div>

      <!-- Spot rows -->
      <CalendarSpotRow
        v-for="spot in spots"
        :key="spot.id"
        :spot="spot"
        :days="dayHeaders"
        :reservations="reservations.filter(r => r.spotId === spot.id)"
      />
    </div>
  </div>
</template>
