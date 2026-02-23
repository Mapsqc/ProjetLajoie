import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reservation, ReservationStatus } from '@/types'
import { reservationsService } from '@/services/reservations.service'

export const useReservationsStore = defineStore('reservations', () => {
  const reservations = ref<Reservation[]>([])
  const currentReservation = ref<Reservation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const statusFilter = ref<ReservationStatus | ''>('')
  const searchQuery = ref('')

  async function fetchReservations() {
    isLoading.value = true
    error.value = null
    try {
      reservations.value = await reservationsService.getAll({
        status: statusFilter.value || undefined,
        search: searchQuery.value || undefined,
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReservationById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentReservation.value = await reservationsService.getById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Reservation introuvable'
    } finally {
      isLoading.value = false
    }
  }

  async function cancelReservation(id: string) {
    try {
      const updated = await reservationsService.cancel(id)
      currentReservation.value = updated
      await fetchReservations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de l\'annulation'
      throw e
    }
  }

  async function holdReservation(id: string) {
    try {
      const updated = await reservationsService.hold(id)
      currentReservation.value = updated
      await fetchReservations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors du passage en attente'
      throw e
    }
  }

  async function confirmReservation(id: string) {
    try {
      const updated = await reservationsService.confirm(id)
      currentReservation.value = updated
      await fetchReservations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la confirmation'
      throw e
    }
  }

  async function updateDates(id: string, checkIn: string, checkOut: string) {
    try {
      const updated = await reservationsService.updateDates(id, checkIn, checkOut)
      currentReservation.value = updated
      await fetchReservations() // Rafraîchir la liste pour refléter les changements
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la modification des dates'
      throw e
    }
  }

  async function addNote(id: string, text: string) {
    try {
      const updated = await reservationsService.addNote(id, text)
      currentReservation.value = updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de l\'ajout de la note'
      throw e
    }
  }

  async function createReservation(data: {
    spotId: string
    customerId: string
    checkIn: string
    checkOut: string
    adultsCount: number
    childrenCount: number
    totalPrice: number
  }) {
    try {
      await reservationsService.create(data)
      await fetchReservations() // Rafraîchit la liste avec les filtres actuels
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la création'
      throw e // Propager l'erreur pour que le composant puisse l'afficher
    }
  }

  async function reassignSpot(id: string, spotId: string) {
    try {
      const updated = await reservationsService.reassignSpot(id, spotId)
      currentReservation.value = updated
      await fetchReservations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la reattribution'
      throw e
    }
  }

  async function updateReservation(id: string, data: {
    spotId: string
    customerId: string
    checkIn: string
    checkOut: string
    adultsCount: number
    childrenCount: number
    status: 'CONFIRMED' | 'HOLD'
  }) {
    try {
      const updated = await reservationsService.updateReservation(id, data)
      currentReservation.value = updated
      await fetchReservations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la modification'
      throw e
    }
  }

  return {
    reservations, currentReservation, isLoading, error,
    statusFilter, searchQuery,
    fetchReservations, fetchReservationById, cancelReservation, holdReservation, confirmReservation, updateDates, addNote, createReservation, reassignSpot, updateReservation,
  }
})
