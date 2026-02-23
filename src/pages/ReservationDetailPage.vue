<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReservationsStore } from '@/stores/reservations.store'
import { useSpotsStore } from '@/stores/spots.store'
import { customersService } from '@/services/customers.service'
import type { Customer } from '@/types'
import { formatDate, getDaysBetween } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import BadgeStatus from '@/components/shared/BadgeStatus.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import EditReservationDialog from '@/features/reservations/EditReservationDialog.vue'
import ReassignSpotDialog from '@/features/reservations/ReassignSpotDialog.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CalendarDays, Ban, MessageSquarePlus, Send, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const reservationsStore = useReservationsStore()
const spotsStore = useSpotsStore()
const customers = ref<Customer[]>([])

const showCancelDialog = ref(false)
const showHoldDialog = ref(false)
const showReassignDialog = ref(false)
const showEditReservationDialog = ref(false)
const isCancelling = ref(false)
const isHolding = ref(false)
const newNote = ref('')
const isAddingNote = ref(false)

const reservation = computed(() => reservationsStore.currentReservation)

const customer = computed(() => {
  if (!reservation.value) return null
  return customers.value.find((c) => c.id === reservation.value!.customerId) || null
})

const spot = computed(() => {
  if (!reservation.value) return null
  return spotsStore.spots.find((s) => s.id === reservation.value!.spotId) || null
})

const nights = computed(() => {
  if (!reservation.value) return 0
  return getDaysBetween(reservation.value.checkIn, reservation.value.checkOut)
})

onMounted(async () => {
  if (spotsStore.spots.length === 0) {
    await spotsStore.fetchSpots()
  }
  customers.value = await customersService.getAll()
  await reservationsStore.fetchReservationById(route.params.id as string)
})

async function handleCancel() {
  isCancelling.value = true
  try {
    await reservationsStore.cancelReservation(reservation.value!.id)
    toast.success('Reservation annulee')
    showCancelDialog.value = false
  } catch {
    toast.error('Erreur lors de l\'annulation')
  } finally {
    isCancelling.value = false
  }
}

async function handleHold() {
  isHolding.value = true
  try {
    await reservationsStore.holdReservation(reservation.value!.id)
    toast.success('Reservation mise en attente')
    showHoldDialog.value = false
  } catch {
    toast.error('Erreur lors du passage en attente')
  } finally {
    isHolding.value = false
  }
}

async function handleAddNote() {
  if (!newNote.value.trim()) return
  isAddingNote.value = true
  try {
    await reservationsStore.addNote(reservation.value!.id, newNote.value.trim())
    newNote.value = ''
    toast.success('Note ajoutee')
  } catch {
    toast.error('Erreur lors de l\'ajout')
  } finally {
    isAddingNote.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push({ name: 'reservations' })">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <PageHeader
        :title="`Reservation ${reservation?.id || ''}`"
        class="flex-1"
      />
    </div>

    <LoadingSpinner v-if="reservationsStore.isLoading" />

    <template v-else-if="reservation">
      <!-- Actions bar -->
      <div class="flex items-center gap-2">
        <BadgeStatus :status="reservation.status" />
        <div class="flex-1" />
        <Button
          v-if="reservation.status === 'CONFIRMED' || reservation.status === 'HOLD'"
          variant="outline"
          size="sm"
          @click="showEditReservationDialog = true"
        >
          <CalendarDays class="mr-2 h-4 w-4" />
          Modifier reservation
        </Button>
        <Button
          v-if="reservation.status === 'CONFIRMED'"
          variant="outline"
          size="sm"
          @click="showHoldDialog = true"
        >
          Mettre en attente
        </Button>
        <Button
          v-if="reservation.status === 'HOLD'"
          variant="outline"
          size="sm"
          @click="showReassignDialog = true"
        >
          <Check class="mr-2 h-4 w-4" />
          Confirmer
        </Button>
        <Button
          v-if="reservation.status === 'CONFIRMED' || reservation.status === 'HOLD'"
          variant="destructive"
          size="sm"
          @click="showCancelDialog = true"
        >
          <Ban class="mr-2 h-4 w-4" />
          Annuler
        </Button>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Client info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent v-if="customer" class="space-y-2 text-sm">
            <p><span class="text-muted-foreground">Nom :</span> {{ customer.firstName }} {{ customer.lastName }}</p>
            <p><span class="text-muted-foreground">Courriel :</span> {{ customer.email }}</p>
            <p><span class="text-muted-foreground">Telephone :</span> {{ customer.phone }}</p>
            <p v-if="customer.city"><span class="text-muted-foreground">Ville :</span> {{ customer.city }}, {{ customer.province }}</p>
          </CardContent>
        </Card>

        <!-- Reservation info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <p><span class="text-muted-foreground">Emplacement :</span> {{ spot ? `#${spot.number}` : reservation.spotId }}</p>
            <p><span class="text-muted-foreground">Arrivee :</span> {{ formatDate(reservation.checkIn) }}</p>
            <p><span class="text-muted-foreground">Depart :</span> {{ formatDate(reservation.checkOut) }}</p>
            <p><span class="text-muted-foreground">Nuits :</span> {{ nights }}</p>
            <p><span class="text-muted-foreground">Adultes :</span> {{ reservation.adultsCount }} | <span class="text-muted-foreground">Enfants :</span> {{ reservation.childrenCount }}</p>
            <Separator />
            <p class="text-lg font-semibold">{{ formatCurrency(reservation.totalPrice) }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Notes -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <MessageSquarePlus class="h-4 w-4" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="reservation.notes.length" class="space-y-3">
            <div
              v-for="note in reservation.notes"
              :key="note.id"
              class="rounded-lg bg-muted p-3"
            >
              <p class="text-sm">{{ note.text }}</p>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ note.author }} — {{ formatDate(note.createdAt) }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground">Aucune note</p>

          <form @submit.prevent="handleAddNote" class="flex gap-2">
            <Input
              v-model="newNote"
              placeholder="Ajouter une note..."
              class="flex-1"
            />
            <Button type="submit" size="sm" :disabled="!newNote.trim() || isAddingNote">
              <Send class="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </template>

    <div v-else-if="reservationsStore.error" class="rounded-md bg-destructive/10 p-4 text-destructive">
      {{ reservationsStore.error }}
    </div>

    <!-- Dialogs -->
    <ConfirmDialog
      :open="showHoldDialog"
      title="Mettre la reservation en attente"
      description="La reservation sera mise en attente et son emplacement actuel redeviendra disponible."
      confirm-label="Mettre en attente"
      :loading="isHolding"
      @update:open="showHoldDialog = $event"
      @confirm="handleHold"
    />

    <ConfirmDialog
      :open="showCancelDialog"
      title="Annuler la reservation"
      description="Etes-vous sur de vouloir annuler cette reservation? Cette action est irreversible."
      confirm-label="Annuler la reservation"
      :destructive="true"
      :loading="isCancelling"
      @update:open="showCancelDialog = $event"
      @confirm="handleCancel"
    />

    <EditReservationDialog
      v-if="reservation"
      v-model:open="showEditReservationDialog"
      :reservation="reservation"
    />

    <ReassignSpotDialog
      v-if="reservation"
      v-model:open="showReassignDialog"
      :reservation="reservation"
    />
  </div>
</template>
