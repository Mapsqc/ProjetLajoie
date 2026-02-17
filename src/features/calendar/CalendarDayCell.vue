<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Reservation } from '@/types'

const props = defineProps<{
  date: string
  isToday: boolean
  reservation: Reservation | null
}>()

const router = useRouter()

const cellClass = computed(() => {
  if (!props.reservation) return ''
  const map: Record<string, string> = {
    CONFIRMED: 'bg-emerald-200 hover:bg-emerald-300',
    HOLD: 'bg-yellow-200 hover:bg-yellow-300',
  }
  return map[props.reservation.status] || ''
})

function handleClick() {
  if (props.reservation) {
    router.push({ name: 'reservation-detail', params: { id: props.reservation.id } })
  }
}
</script>

<template>
  <div
    class="flex-1 border-r h-8 transition-colors"
    :class="[
      cellClass,
      isToday && !reservation ? 'bg-primary/5' : '',
      reservation ? 'cursor-pointer' : '',
    ]"
    :title="reservation ? `${reservation.id} (${reservation.status})` : ''"
    @click="handleClick"
  />
</template>
