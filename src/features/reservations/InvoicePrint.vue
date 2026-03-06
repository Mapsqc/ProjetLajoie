<script setup lang="ts">
import { computed } from 'vue'
import type { Reservation, Spot } from '@/types'
import { SERVICE_LABELS } from '@/types'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { computePriceBreakdown, BASE_OCCUPANCY, EXTRA_PERSON_FEE, TAX_RATE } from '@/utils/pricing'

const props = defineProps<{
  reservation: Reservation
  spot: Spot
}>()

const nights = computed(() => {
  const d1 = new Date(props.reservation.checkIn)
  const d2 = new Date(props.reservation.checkOut)
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
})

const breakdown = computed(() =>
  computePriceBreakdown(props.spot.pricePerNight, nights.value, props.reservation.adultsCount)
)

const extraPersons = computed(() => Math.max(0, props.reservation.adultsCount - BASE_OCCUPANCY))

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    CONFIRMED: 'Confirmee',
    HOLD: 'En attente',
    CANCELLED: 'Annulee',
    EXPIRED: 'Expiree',
    COMPLETED: 'Terminee',
    NO_SHOW: 'Absent',
  }
  return map[props.reservation.status] || props.reservation.status
})

const today = computed(() => formatDate(new Date().toISOString()))
</script>

<template>
  <div class="invoice-print hidden print:block print:p-0 print:m-0">
    <div class="w-full max-w-[500px] mx-auto p-6 text-sm font-sans">
      <!-- En-tete -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold tracking-tight">CAMPING LAJOIE</h1>
        <p class="text-xs text-gray-500 mt-1">www.delajoiequebec.com</p>
      </div>

      <!-- Dates (element central) -->
      <div class="my-6 border-4 border-black rounded-lg p-6">
        <div class="grid grid-cols-2 gap-6 text-center">
          <div>
            <p class="text-sm uppercase font-bold text-gray-500 mb-2">Arrivee</p>
            <p class="text-4xl font-black leading-tight">{{ formatDate(reservation.checkIn) }}</p>
          </div>
          <div>
            <p class="text-sm uppercase font-bold text-gray-500 mb-2">Depart</p>
            <p class="text-4xl font-black leading-tight">{{ formatDate(reservation.checkOut) }}</p>
          </div>
        </div>
        <p class="text-center text-base text-gray-600 mt-3 font-medium">{{ nights }} nuit{{ nights > 1 ? 's' : '' }}</p>
      </div>

      <!-- Sejour -->
      <div class="mb-4">
        <div class="grid grid-cols-2 gap-y-1">
          <span class="text-gray-600">Emplacement</span>
          <span class="text-right font-medium">#{{ spot.number }} — {{ SERVICE_LABELS[spot.service] }}</span>
          <span class="text-gray-600">Adultes</span>
          <span class="text-right">{{ reservation.adultsCount }}</span>
          <span v-if="reservation.childrenCount > 0" class="text-gray-600">Enfants</span>
          <span v-if="reservation.childrenCount > 0" class="text-right">{{ reservation.childrenCount }}</span>
        </div>
      </div>

      <div class="border-t border-gray-300 my-4" />

      <!-- Detail des prix -->
      <div class="mb-4">
        <p class="font-semibold text-xs uppercase text-gray-500 mb-1">Detail</p>
        <div class="grid grid-cols-2 gap-y-1">
          <span class="text-gray-600">{{ formatCurrency(spot.pricePerNight) }} x {{ nights }} nuit{{ nights > 1 ? 's' : '' }}</span>
          <span class="text-right">{{ formatCurrency(breakdown.baseSubtotal) }}</span>

          <template v-if="extraPersons > 0">
            <span class="text-gray-600">Suppl. personne ({{ extraPersons }} x {{ nights }} nuits x {{ EXTRA_PERSON_FEE }}$)</span>
            <span class="text-right">{{ formatCurrency(breakdown.extraPersonFee) }}</span>
          </template>

          <span class="text-gray-600">Sous-total</span>
          <span class="text-right">{{ formatCurrency(breakdown.subtotal) }}</span>

          <span class="text-gray-600">Taxes ({{ (TAX_RATE * 100).toFixed(3) }}%)</span>
          <span class="text-right">{{ formatCurrency(breakdown.taxAmount) }}</span>
        </div>

        <div class="border-t border-gray-300 mt-2 pt-2 grid grid-cols-2">
          <span class="font-bold text-base">TOTAL</span>
          <span class="text-right font-bold text-base">{{ formatCurrency(breakdown.total) }}</span>
        </div>
      </div>

      <div class="border-t border-gray-300 my-4" />

      <!-- Pied -->
      <div class="text-xs text-gray-500 text-center space-y-1">
        <p>Reservation #{{ reservation.id }} — {{ statusLabel }}</p>
        <p>Genere le {{ today }}</p>
      </div>
    </div>
  </div>
</template>
