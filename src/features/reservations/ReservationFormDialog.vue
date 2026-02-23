<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ReservationFormSchema, SERVICE_LABELS, VEHICLE_TYPE_LABELS, GROUND_LABELS } from '@/types'
import type { SpotService, VehicleType, GroundType } from '@/types'
import { useSpotsStore } from '@/stores/spots.store'
import { useReservationsStore } from '@/stores/reservations.store'
import { customersService } from '@/services/customers.service'
import { dayjs } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { computeTotalWithTax } from '@/utils/pricing'
import { RANGED_VEHICLE_TYPES } from '@/utils/spot-filters'
import type { Customer } from '@/types'
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
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const spotsStore = useSpotsStore()
const reservationsStore = useReservationsStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

// Customer state
const customers = ref<Customer[]>([])
const isNewCustomer = ref(false)
const newCustomer = ref({ firstName: '', lastName: '', email: '', phone: '' })

// Form data
const form = ref({
  spotId: '',
  customerId: '',
  checkIn: '',
  checkOut: '',
  adultsCount: 1,
  childrenCount: 0,
})

const today = computed(() => dayjs().format('YYYY-MM-DD'))

const datesValid = computed(() => {
  return form.value.checkIn !== '' && form.value.checkOut !== '' && form.value.checkIn < form.value.checkOut
})

// Whether the vehicle length input should be shown
const showLengthInput = computed(() => {
  return (
    spotsStore.selectedVehicleType !== '' &&
    RANGED_VEHICLE_TYPES.includes(spotsStore.selectedVehicleType as VehicleType)
  )
})

// Spots after cascade filtering + overlap exclusion
const availableSpots = computed(() => {
  let spots = spotsStore.filteredSpots

  // Exclude spots with overlapping active reservations
  if (datesValid.value) {
    spots = spots.filter((s) => {
      const hasOverlap = reservationsStore.reservations.some((r) => {
        if (r.spotId !== s.id) return false
        if (r.status === 'HOLD' || r.status === 'CANCELLED' || r.status === 'EXPIRED' || r.status === 'NO_SHOW') return false
        return r.checkIn < form.value.checkOut && r.checkOut > form.value.checkIn
      })
      return !hasOverlap
    })
  }

  return spots
})

const noSpotsAvailable = computed(() => {
  return datesValid.value && availableSpots.value.length === 0
})

const selectedSpot = computed(() => {
  return spotsStore.spots.find((s) => s.id === form.value.spotId)
})

const nights = computed(() => {
  if (!form.value.checkIn || !form.value.checkOut) return 0
  const n = dayjs(form.value.checkOut).diff(dayjs(form.value.checkIn), 'day')
  return n > 0 ? n : 0
})

const totalPrice = computed(() => {
  if (!selectedSpot.value || nights.value <= 0) return 0
  return computeTotalWithTax(selectedSpot.value.pricePerNight, nights.value, safeAdultsCount.value)
})

// Sanitize numeric fields to avoid NaN
const safeAdultsCount = computed(() => {
  const v = form.value.adultsCount
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
})

const safeChildrenCount = computed(() => {
  const v = form.value.childrenCount
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
})

const canSubmit = computed(() => {
  if (!datesValid.value) return false
  if (!form.value.spotId) return false
  if (!isNewCustomer.value && !form.value.customerId) return false
  if (isNewCustomer.value) {
    if (!newCustomer.value.firstName.trim()) return false
    if (!newCustomer.value.lastName.trim()) return false
    if (!newCustomer.value.email.trim()) return false
    if (!newCustomer.value.phone.trim()) return false
  }
  if (safeAdultsCount.value < 1) return false
  if (isSubmitting.value) return false
  return true
})

// --- Watchers for cascade resets ---

// When service changes, reset downstream filters + spot selection
watch(() => spotsStore.selectedService, () => {
  spotsStore.resetCascadingFilters('service')
  form.value.spotId = ''
})

// When vehicle type changes, reset downstream filters + spot selection
watch(() => spotsStore.selectedVehicleType, () => {
  spotsStore.resetCascadingFilters('vehicle')
  form.value.spotId = ''
})

// When vehicle length changes, reset spot selection
watch(() => spotsStore.selectedVehicleLength, () => {
  spotsStore.resetCascadingFilters('length')
  form.value.spotId = ''
})

// When ground changes, reset spot selection
watch(() => spotsStore.selectedGround, () => {
  form.value.spotId = ''
})

// Reset spot selection when dates change (spot may no longer be available)
watch([() => form.value.checkIn, () => form.value.checkOut], () => {
  if (form.value.spotId && !availableSpots.value.find((s) => s.id === form.value.spotId)) {
    form.value.spotId = ''
  }
})

// Ensure checkOut is always after checkIn
watch(() => form.value.checkIn, (newCheckIn) => {
  if (newCheckIn && form.value.checkOut && form.value.checkOut <= newCheckIn) {
    form.value.checkOut = ''
  }
})

watch(() => props.open, async (open) => {
  if (open) {
    form.value = { spotId: '', customerId: '', checkIn: '', checkOut: '', adultsCount: 1, childrenCount: 0 }
    spotsStore.resetAllCascadeFilters()
    isNewCustomer.value = false
    newCustomer.value = { firstName: '', lastName: '', email: '', phone: '' }
    errors.value = {}

    if (spotsStore.spots.length === 0) {
      await spotsStore.fetchSpots()
    }
    if (reservationsStore.reservations.length === 0) {
      await reservationsStore.fetchReservations()
    }
    customers.value = await customersService.getAll()
  }
})

function handleServiceChange(val: unknown) {
  const strVal = typeof val === 'string' ? val : String(val ?? '')
  spotsStore.selectedService = (strVal === 'NONE' ? '' : strVal) as SpotService | ''
}

function handleVehicleTypeChange(val: unknown) {
  const strVal = typeof val === 'string' ? val : String(val ?? '')
  spotsStore.selectedVehicleType = (strVal === 'NONE' ? '' : strVal) as VehicleType | ''
}

function handleGroundChange(val: unknown) {
  const strVal = typeof val === 'string' ? val : String(val ?? '')
  spotsStore.selectedGround = (strVal === 'NONE' ? '' : strVal) as GroundType | ''
}

function handleLengthInput(event: Event) {
  const val = (event.target as HTMLInputElement).value
  spotsStore.selectedVehicleLength = val === '' ? null : Number(val)
}

function validate(): boolean {
  errors.value = {}

  // Dates
  if (!form.value.checkIn) {
    errors.value.checkIn = "La date d'arrivée est requise"
  } else if (form.value.checkIn < today.value) {
    errors.value.checkIn = "La date d'arrivée ne peut pas être dans le passé"
  }

  if (!form.value.checkOut) {
    errors.value.checkOut = 'La date de départ est requise'
  } else if (form.value.checkIn && form.value.checkOut <= form.value.checkIn) {
    errors.value.checkOut = "La date de départ doit être après la date d'arrivée"
  }

  // Spot
  if (!form.value.spotId) {
    errors.value.spotId = "L'emplacement est requis"
  }

  // Travelers
  if (safeAdultsCount.value < 1) {
    errors.value.adultsCount = 'Au moins 1 adulte est requis'
  }
  if (safeChildrenCount.value < 0) {
    errors.value.childrenCount = 'Le nombre d\'enfants ne peut pas être négatif'
  }

  // Customer
  if (isNewCustomer.value) {
    if (!newCustomer.value.firstName.trim()) {
      errors.value['customer.firstName'] = 'Le prénom est requis'
    }
    if (!newCustomer.value.lastName.trim()) {
      errors.value['customer.lastName'] = 'Le nom est requis'
    }
    if (!newCustomer.value.email.trim()) {
      errors.value['customer.email'] = 'Le courriel est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.value.email.trim())) {
      errors.value['customer.email'] = 'Le format du courriel est invalide'
    }
    if (!newCustomer.value.phone.trim()) {
      errors.value['customer.phone'] = 'Le téléphone est requis'
    }
  } else {
    if (!form.value.customerId) {
      errors.value.customerId = 'Le client est requis'
    }
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  let customerId = form.value.customerId

  // Create new customer if needed
  if (isNewCustomer.value) {
    try {
      const created = await customersService.create(newCustomer.value)
      customerId = created.id
      customers.value = [created, ...customers.value]
      isNewCustomer.value = false
      form.value.customerId = customerId
    } catch (err) {
      console.error('Erreur création client:', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage === 'EMAIL_UNIQUE') {
        errors.value['customer.email'] = 'Un client avec ce courriel existe déjà'
        return
      }
      toast.error('Erreur lors de la création du client')
      return
    }
  }

  // Sanitize numeric values before validation
  const formData = {
    spotId: form.value.spotId,
    customerId,
    checkIn: form.value.checkIn,
    checkOut: form.value.checkOut,
    adultsCount: safeAdultsCount.value,
    childrenCount: safeChildrenCount.value,
  }

  const result = ReservationFormSchema.safeParse(formData)
  if (!result.success) {
    console.error('Validation Zod échouée:', result.error.issues)
    result.error.issues.forEach((e) => {
      const path = e.path.join('.')
      errors.value[path] = e.message
    })
    return
  }

  isSubmitting.value = true
  try {
    await reservationsStore.createReservation({
      ...result.data,
      totalPrice: totalPrice.value,
    })
    toast.success('Réservation créée avec succès')
    emit('update:open', false)
  } catch (err) {
    console.error('Erreur création réservation:', err)
    toast.error('Erreur lors de la création de la réservation')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nouvelle réservation</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 1. Dates -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="checkIn">Date d'arrivée</Label>
            <Input id="checkIn" type="date" v-model="form.checkIn" :min="today" />
            <p v-if="errors.checkIn" class="text-xs text-destructive">{{ errors.checkIn }}</p>
          </div>
          <div class="space-y-2">
            <Label for="checkOut">Date de départ</Label>
            <Input
              id="checkOut"
              type="date"
              v-model="form.checkOut"
              :min="form.checkIn || today"
              :disabled="!form.checkIn"
            />
            <p v-if="errors.checkOut" class="text-xs text-destructive">{{ errors.checkOut }}</p>
          </div>
        </div>

        <!-- 2. Cascade filters (visible only when dates are valid) -->
        <template v-if="datesValid">
          <div class="space-y-3">
            <Label class="text-sm font-medium">Filtres emplacement</Label>

            <div class="grid gap-3 sm:grid-cols-2">
              <!-- Service filter -->
              <div class="space-y-1">
                <Label class="text-xs text-muted-foreground">Service</Label>
                <Select :model-value="spotsStore.selectedService || 'NONE'" @update:model-value="handleServiceChange">
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Tous les services</SelectItem>
                    <SelectItem
                      v-for="svc in spotsStore.availableServices"
                      :key="svc"
                      :value="svc"
                    >
                      {{ SERVICE_LABELS[svc] }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Vehicle type filter -->
              <div class="space-y-1">
                <Label class="text-xs text-muted-foreground">Type de véhicule</Label>
                <Select
                  :model-value="spotsStore.selectedVehicleType || 'NONE'"
                  :disabled="!spotsStore.selectedService"
                  @update:model-value="handleVehicleTypeChange"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les véhicules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Tous les véhicules</SelectItem>
                    <SelectItem
                      v-for="vt in spotsStore.availableVehicleTypes"
                      :key="vt"
                      :value="vt"
                    >
                      {{ VEHICLE_TYPE_LABELS[vt] }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <!-- Vehicle length (only for ranged types) -->
              <div v-if="showLengthInput" class="space-y-1">
                <Label class="text-xs text-muted-foreground">Longueur du véhicule (pi)</Label>
                <Input
                  type="number"
                  :model-value="spotsStore.selectedVehicleLength ?? ''"
                  @input="handleLengthInput"
                  min="1"
                  placeholder="Ex: 30"
                />
              </div>

              <!-- Ground type filter -->
              <div class="space-y-1">
                <Label class="text-xs text-muted-foreground">Type de sol</Label>
                <Select :model-value="spotsStore.selectedGround || 'NONE'" @update:model-value="handleGroundChange">
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les sols" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Tous les sols</SelectItem>
                    <SelectItem
                      v-for="gt in spotsStore.availableGroundTypes"
                      :key="gt"
                      :value="gt"
                    >
                      {{ GROUND_LABELS[gt] }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- 3. Spot selection -->
          <div class="space-y-2">
            <Label for="spotId">Emplacement</Label>
            <Select v-model="form.spotId" :disabled="noSpotsAvailable">
              <SelectTrigger>
                <SelectValue :placeholder="noSpotsAvailable ? 'Aucun terrain disponible' : 'Choisir un emplacement'" />
              </SelectTrigger>
              <SelectContent v-if="!noSpotsAvailable">
                <SelectItem v-for="spot in availableSpots" :key="spot.id" :value="spot.id">
                  #{{ spot.number }} — {{ SERVICE_LABELS[spot.service] }} — {{ formatCurrency(spot.pricePerNight) }}/nuit
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.spotId" class="text-xs text-destructive">{{ errors.spotId }}</p>
            <p v-if="noSpotsAvailable" class="text-xs text-destructive">
              Aucun terrain ne correspond à ces critères pour la plage de dates sélectionnée. Essayez de modifier les filtres ou les dates.
            </p>
          </div>
        </template>

        <!-- 4. Travelers -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="adults">Adultes</Label>
            <Input id="adults" type="number" v-model.number="form.adultsCount" min="1" />
            <p v-if="errors.adultsCount" class="text-xs text-destructive">{{ errors.adultsCount }}</p>
          </div>
          <div class="space-y-2">
            <Label for="children">Enfants</Label>
            <Input id="children" type="number" v-model.number="form.childrenCount" min="0" />
            <p v-if="errors.childrenCount" class="text-xs text-destructive">{{ errors.childrenCount }}</p>
          </div>
        </div>

        <!-- 5. Customer -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Client</Label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="isNewCustomer" class="rounded" />
              Nouveau client
            </label>
          </div>

          <template v-if="!isNewCustomer">
            <Select v-model="form.customerId">
              <SelectTrigger>
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in customers" :key="c.id" :value="c.id">
                  {{ c.firstName }} {{ c.lastName }} — {{ c.email }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.customerId" class="text-xs text-destructive">{{ errors.customerId }}</p>
          </template>

          <template v-else>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1">
                <Input v-model="newCustomer.firstName" placeholder="Prénom" />
                <p v-if="errors['customer.firstName']" class="text-xs text-destructive">{{ errors['customer.firstName'] }}</p>
              </div>
              <div class="space-y-1">
                <Input v-model="newCustomer.lastName" placeholder="Nom" />
                <p v-if="errors['customer.lastName']" class="text-xs text-destructive">{{ errors['customer.lastName'] }}</p>
              </div>
              <div class="space-y-1">
                <Input v-model="newCustomer.email" type="email" placeholder="Courriel" />
                <p v-if="errors['customer.email']" class="text-xs text-destructive">{{ errors['customer.email'] }}</p>
              </div>
              <div class="space-y-1">
                <Input v-model="newCustomer.phone" placeholder="Téléphone" />
                <p v-if="errors['customer.phone']" class="text-xs text-destructive">{{ errors['customer.phone'] }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- 6. Price display -->
        <div v-if="selectedSpot && nights > 0" class="rounded-lg border bg-muted/50 p-3">
          <div class="flex items-center justify-between text-sm">
            <span>{{ formatCurrency(selectedSpot.pricePerNight) }} x {{ nights }} nuit{{ nights > 1 ? 's' : '' }}</span>
            <span class="font-semibold text-base">{{ formatCurrency(totalPrice) }}</span>
          </div>
        </div>

        <!-- 7. Status info + buttons -->
        <p class="text-xs text-muted-foreground">Statut initial : Confirmée</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="!canSubmit">
            {{ isSubmitting ? 'En cours...' : 'Créer la réservation' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
