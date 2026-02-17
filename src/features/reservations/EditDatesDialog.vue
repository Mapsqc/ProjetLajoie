<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Reservation } from '@/types'
import { useReservationsStore } from '@/stores/reservations.store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  reservation: Reservation
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const reservationsStore = useReservationsStore()
const checkIn = ref('')
const checkOut = ref('')
const isSubmitting = ref(false)

watch(() => props.open, (open) => {
  if (open) {
    checkIn.value = props.reservation.checkIn
    checkOut.value = props.reservation.checkOut
  }
})

async function handleSubmit() {
  if (!checkIn.value || !checkOut.value) return
  if (checkIn.value >= checkOut.value) {
    toast.error('La date de depart doit etre apres la date d\'arrivee')
    return
  }

  isSubmitting.value = true
  try {
    await reservationsStore.updateDates(props.reservation.id, checkIn.value, checkOut.value)
    toast.success('Dates modifiees')
    emit('update:open', false)
  } catch {
    toast.error('Erreur lors de la modification')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier les dates</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="checkin">Date d'arrivee</Label>
          <Input id="checkin" type="date" v-model="checkIn" />
        </div>
        <div class="space-y-2">
          <Label for="checkout">Date de depart</Label>
          <Input id="checkout" type="date" v-model="checkOut" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'En cours...' : 'Modifier' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
