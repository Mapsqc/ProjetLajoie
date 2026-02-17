import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Spot, SpotFormData, SpotType } from '@/types'
import { spotsService } from '@/services/spots.service'

export const useSpotsStore = defineStore('spots', () => {
  const spots = ref<Spot[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const typeFilter = ref<SpotType | ''>('')

  async function fetchSpots() {
    isLoading.value = true
    error.value = null
    try {
      spots.value = await spotsService.getAll({
        search: searchQuery.value || undefined,
        type: typeFilter.value || undefined,
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
    } finally {
      isLoading.value = false
    }
  }

  async function createSpot(data: SpotFormData) {
    try {
      await spotsService.create(data)
      await fetchSpots() // Rafraîchit la liste avec les filtres actuels
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la création'
      throw e // Propager l'erreur pour que le composant puisse l'afficher
    }
  }

  async function updateSpot(id: string, data: Partial<SpotFormData>) {
    try {
      await spotsService.update(id, data)
      await fetchSpots()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la modification'
      throw e
    }
  }

  async function toggleActive(id: string) {
    try {
      await spotsService.toggleActive(id)
      await fetchSpots()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la modification'
      throw e
    }
  }

  return { spots, isLoading, error, searchQuery, typeFilter, fetchSpots, createSpot, updateSpot, toggleActive }
})
