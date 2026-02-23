<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Reservation } from '@/types'
import { useSpotsStore } from '@/stores/spots.store'
import { useReservationsStore } from '@/stores/reservations.store'
import { getDaysBetween } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { computeTotalWithTax } from '@/utils/pricing'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  reservation: Reservation
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const spotsStore = useSpotsStore()
const reservationsStore = useReservationsStore()
const isSubmitting = ref(false)
const selectedSpotId = ref('')

const nights = computed(() => {
  return Math.max(1, getDaysBetween(props.reservation.checkIn, props.reservation.checkOut))
})

const availableSpots = computed(() => {
  return spotsStore.spots.filter((spot) => {
    if (!spot.isActive) return false

    const hasOverlap = reservationsStore.reservations.some((r) => {
      if (r.id === props.reservation.id) return false
      if (r.spotId !== spot.id) return false
      if (r.status === 'HOLD' || r.status === 'CANCELLED' || r.status === 'EXPIRED' || r.status === 'NO_SHOW') {
        return false
      }
      return r.checkIn < props.reservation.checkOut && r.checkOut > props.reservation.checkIn
    })

    return !hasOverlap
  })
})

const selectedSpot = computed(() => {
  return spotsStore.spots.find((spot) => spot.id === selectedSpotId.value) || null
})

const recalculatedTotal = computed(() => {
  if (!selectedSpot.value) return props.reservation.totalPrice
  return computeTotalWithTax(selectedSpot.value.pricePerNight, nights.value, props.reservation.adultsCount)
})

const canSubmit = computed(() => {
  if (props.reservation.status !== 'HOLD') return false
  if (!selectedSpotId.value) return false
  if (!availableSpots.value.some((s) => s.id === selectedSpotId.value)) return false
  if (isSubmitting.value) return false
  return true
})

watch(() => props.open, async (open) => {
  if (!open) return

  if (spotsStore.spots.length === 0 || reservationsStore.reservations.length === 0) {
    await Promise.all([
      spotsStore.fetchSpots(),
      reservationsStore.fetchReservations(),
    ])
  }

  selectedSpotId.value = props.reservation.spotId
})

async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    if (selectedSpotId.value !== props.reservation.spotId) {
      await reservationsStore.reassignSpot(props.reservation.id, selectedSpotId.value)
    }
    await reservationsStore.confirmReservation(props.reservation.id)
    toast.success('Reservation confirmee')
    emit('update:open', false)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la confirmation'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirmer la reservation</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Choisissez l'emplacement a attribuer pour confirmer cette reservation.
          L'emplacement actuel est pre-selectionne s'il est disponible.
        </p>

        <div class="space-y-2">
          <Label for="spotId">Nouvel emplacement</Label>
          <Select v-model="selectedSpotId" :disabled="availableSpots.length === 0 || isSubmitting">
            <SelectTrigger id="spotId">
              <SelectValue :placeholder="availableSpots.length === 0 ? 'Aucun emplacement disponible' : 'Choisir un emplacement'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="spot in availableSpots" :key="spot.id" :value="spot.id">
                #{{ spot.number }} - {{ formatCurrency(spot.pricePerNight) }}/nuit
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="selectedSpot" class="rounded-md border bg-muted/40 p-3 text-sm">
          <p><span class="text-muted-foreground">Emplacement actuel :</span> {{ props.reservation.spotId }}</p>
          <p><span class="text-muted-foreground">Nouvel emplacement :</span> #{{ selectedSpot.number }}</p>
          <p><span class="text-muted-foreground">Nouveau total :</span> {{ formatCurrency(recalculatedTotal) }}</p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)" :disabled="isSubmitting">
          Annuler
        </Button>
        <Button type="button" @click="handleSubmit" :disabled="!canSubmit">
          {{ isSubmitting ? 'En cours...' : 'Confirmer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
