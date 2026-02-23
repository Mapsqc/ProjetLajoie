<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Customer, Reservation } from '@/types'
import { useReservationsStore } from '@/stores/reservations.store'
import { useSpotsStore } from '@/stores/spots.store'
import { customersService } from '@/services/customers.service'
import { dayjs } from '@/utils/date'
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
import { Input } from '@/components/ui/input'
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

const reservationsStore = useReservationsStore()
const spotsStore = useSpotsStore()
const customers = ref<Customer[]>([])
const isInitializing = ref(false)
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  spotId: '',
  customerId: '',
  checkIn: '',
  checkOut: '',
  adultsCount: 1,
  childrenCount: 0,
  status: 'CONFIRMED' as 'CONFIRMED' | 'HOLD',
})

const activeSpots = computed(() => spotsStore.spots.filter((s) => s.isActive))

const datesValid = computed(() => {
  return form.value.checkIn !== '' && form.value.checkOut !== '' && form.value.checkIn < form.value.checkOut
})

const spotTakenForConfirmed = computed(() => {
  if (form.value.status !== 'CONFIRMED') return false
  if (!datesValid.value) return false
  if (!form.value.spotId) return false

  return reservationsStore.reservations.some((r) => {
    if (r.id === props.reservation.id) return false
    if (r.spotId !== form.value.spotId) return false
    if (r.status === 'HOLD' || r.status === 'CANCELLED' || r.status === 'EXPIRED' || r.status === 'NO_SHOW') {
      return false
    }
    return r.checkIn < form.value.checkOut && r.checkOut > form.value.checkIn
  })
})

const selectedSpot = computed(() => {
  return spotsStore.spots.find((s) => s.id === form.value.spotId) || null
})

const nights = computed(() => {
  if (!datesValid.value) return 0
  const n = dayjs(form.value.checkOut).diff(dayjs(form.value.checkIn), 'day')
  return n > 0 ? n : 0
})

const totalPrice = computed(() => {
  if (!selectedSpot.value || nights.value <= 0) return 0
  return computeTotalWithTax(selectedSpot.value.pricePerNight, nights.value, form.value.adultsCount)
})

const canSubmit = computed(() => {
  if (isInitializing.value) return false
  if (isSubmitting.value) return false
  return true
})

watch(() => props.open, async (open) => {
  if (!open) return

  errors.value = {}
  isInitializing.value = true
  form.value = {
    spotId: props.reservation.spotId,
    customerId: props.reservation.customerId,
    checkIn: props.reservation.checkIn,
    checkOut: props.reservation.checkOut,
    adultsCount: props.reservation.adultsCount,
    childrenCount: props.reservation.childrenCount,
    status: props.reservation.status === 'HOLD' ? 'HOLD' : 'CONFIRMED',
  }

  try {
    await Promise.all([
      spotsStore.fetchSpots(),
      reservationsStore.fetchReservations(),
    ])
    customers.value = await customersService.getAll()
  } catch (err) {
    console.error('Erreur chargement formulaire reservation:', err)
    toast.error('Erreur lors du chargement des donnees')
  } finally {
    isInitializing.value = false
  }
})

function validate(): boolean {
  errors.value = {}

  if (!form.value.checkIn) {
    errors.value.checkIn = "La date d'arrivee est requise"
  }
  if (!form.value.checkOut) {
    errors.value.checkOut = 'La date de depart est requise'
  }
  if (form.value.checkIn && form.value.checkOut && form.value.checkIn >= form.value.checkOut) {
    errors.value.checkOut = "La date de depart doit etre apres la date d'arrivee"
  }
  if (!form.value.spotId) {
    errors.value.spotId = "L'emplacement est requis"
  }
  if (!form.value.customerId) {
    errors.value.customerId = 'Le client est requis'
  }
  if (form.value.adultsCount < 1) {
    errors.value.adultsCount = 'Au moins 1 adulte est requis'
  }
  if (form.value.childrenCount < 0) {
    errors.value.childrenCount = "Le nombre d'enfants ne peut pas etre negatif"
  }
  if (spotTakenForConfirmed.value) {
    errors.value.spotId = 'cette plage horaire est maintenant prise'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) {
    toast.error('Veuillez corriger les champs en erreur')
    return
  }

  isSubmitting.value = true
  try {
    await reservationsStore.updateReservation(props.reservation.id, {
      spotId: form.value.spotId,
      customerId: form.value.customerId,
      checkIn: form.value.checkIn,
      checkOut: form.value.checkOut,
      adultsCount: form.value.adultsCount,
      childrenCount: form.value.childrenCount,
      status: form.value.status,
    })
    toast.success('Reservation modifiee')
    emit('update:open', false)
  } catch (err) {
    console.error('Erreur modification reservation:', err)
    const message = err instanceof Error ? err.message : 'Erreur lors de la modification'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Modifier la reservation</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="checkin">Date d'arrivee</Label>
            <Input id="checkin" type="date" v-model="form.checkIn" />
            <p v-if="errors.checkIn" class="text-xs text-destructive">{{ errors.checkIn }}</p>
          </div>
          <div class="space-y-2">
            <Label for="checkout">Date de depart</Label>
            <Input id="checkout" type="date" v-model="form.checkOut" />
            <p v-if="errors.checkOut" class="text-xs text-destructive">{{ errors.checkOut }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="spotId">Emplacement</Label>
          <Select v-model="form.spotId">
            <SelectTrigger id="spotId">
              <SelectValue placeholder="Choisir un emplacement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="spot in activeSpots" :key="spot.id" :value="spot.id">
                #{{ spot.number }} - {{ formatCurrency(spot.pricePerNight) }}/nuit
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.spotId" class="text-xs text-destructive">{{ errors.spotId }}</p>
          <p v-if="spotTakenForConfirmed" class="text-xs text-destructive">cette plage horaire est maintenant prise</p>
        </div>

        <div class="space-y-2">
          <Label for="customerId">Client</Label>
          <Select v-model="form.customerId">
            <SelectTrigger id="customerId">
              <SelectValue placeholder="Choisir un client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in customers" :key="c.id" :value="c.id">
                {{ c.firstName }} {{ c.lastName }} - {{ c.email }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.customerId" class="text-xs text-destructive">{{ errors.customerId }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="adults">Adultes</Label>
            <Input id="adults" type="number" min="1" v-model.number="form.adultsCount" />
            <p v-if="errors.adultsCount" class="text-xs text-destructive">{{ errors.adultsCount }}</p>
          </div>
          <div class="space-y-2">
            <Label for="children">Enfants</Label>
            <Input id="children" type="number" min="0" v-model.number="form.childrenCount" />
            <p v-if="errors.childrenCount" class="text-xs text-destructive">{{ errors.childrenCount }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="status">Statut</Label>
          <Select v-model="form.status">
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONFIRMED">Confirmee</SelectItem>
              <SelectItem value="HOLD">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="selectedSpot && nights > 0" class="rounded-md border bg-muted/40 p-3 text-sm">
          <p><span class="text-muted-foreground">Nuits :</span> {{ nights }}</p>
          <p><span class="text-muted-foreground">Nouveau total :</span> {{ formatCurrency(totalPrice) }}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)" :disabled="isSubmitting">
            Annuler
          </Button>
          <Button type="button" :disabled="!canSubmit" @click="handleSubmit">
            {{ isInitializing ? 'Chargement...' : isSubmitting ? 'En cours...' : 'Enregistrer' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
