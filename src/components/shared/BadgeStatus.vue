<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  status: string
}>()

const config = computed(() => {
  const map: Record<string, { label: string; class: string }> = {
    CONFIRMED: { label: 'Confirmee', class: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50' },
    HOLD: { label: 'En attente', class: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50' },
    CANCELLED: { label: 'Annulee', class: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-50' },
    EXPIRED: { label: 'Expiree', class: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-50' },
    COMPLETED: { label: 'Terminee', class: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50' },
    NO_SHOW: { label: 'Absent', class: 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-100' },
  }
  return map[props.status] || { label: props.status, class: 'bg-gray-100 text-gray-800' }
})
</script>

<template>
  <Badge variant="secondary" :class="config.class">
    {{ config.label }}
  </Badge>
</template>
