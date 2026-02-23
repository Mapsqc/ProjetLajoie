import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Spot, SpotFormData, SpotService, VehicleType, GroundType } from '@/types'
import { spotsService } from '@/services/spots.service'
import {
  spotAcceptsVehicleType,
  spotAcceptsVehicleLength,
  ALL_VEHICLE_TYPES,
  RANGED_VEHICLE_TYPES,
} from '@/utils/spot-filters'

export const useSpotsStore = defineStore('spots', () => {
  // --- Raw data ---
  const spots = ref<Spot[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Admin page filters ---
  const searchQuery = ref('')
  const serviceFilter = ref<SpotService | ''>('')

  // --- Cascade filters (used by reservation form) ---
  const selectedService = ref<SpotService | ''>('')
  const selectedVehicleType = ref<VehicleType | ''>('')
  const selectedVehicleLength = ref<number | null>(null)
  const selectedGround = ref<GroundType | ''>('')

  // --- Base: only REGULAR + active spots for reservation search ---
  const searchableSpots = computed(() =>
    spots.value.filter((s) => s.isActive && s.status === 'REGULAR')
  )

  // --- Cascade level 1: filter by service ---
  const spotsAfterService = computed(() => {
    if (!selectedService.value) return searchableSpots.value
    return searchableSpots.value.filter((s) => s.service === selectedService.value)
  })

  // --- Cascade level 2: filter by vehicle type ---
  const spotsAfterVehicle = computed(() => {
    if (!selectedVehicleType.value) return spotsAfterService.value
    return spotsAfterService.value.filter((s) =>
      spotAcceptsVehicleType(s, selectedVehicleType.value as VehicleType)
    )
  })

  // --- Cascade level 3: filter by vehicle length ---
  const spotsAfterLength = computed(() => {
    if (
      !selectedVehicleType.value ||
      selectedVehicleLength.value === null ||
      !RANGED_VEHICLE_TYPES.includes(selectedVehicleType.value as VehicleType)
    ) {
      return spotsAfterVehicle.value
    }
    return spotsAfterVehicle.value.filter((s) =>
      spotAcceptsVehicleLength(
        s,
        selectedVehicleType.value as VehicleType,
        selectedVehicleLength.value!
      )
    )
  })

  // --- Cascade level 4: filter by ground type ---
  const spotsAfterOptional = computed(() => {
    let result = spotsAfterLength.value
    if (selectedGround.value) {
      result = result.filter((s) => s.sol === selectedGround.value)
    }
    return result
  })

  /** Final filtered spots for reservation form */
  const filteredSpots = computed(() => spotsAfterOptional.value)

  // --- Available options at each cascade level ---

  const availableServices = computed(() => {
    const set = new Set(searchableSpots.value.map((s) => s.service))
    return [...set].sort()
  })

  const availableVehicleTypes = computed(() => {
    return ALL_VEHICLE_TYPES.filter((vt) =>
      spotsAfterService.value.some((s) => spotAcceptsVehicleType(s, vt))
    )
  })

  const availableGroundTypes = computed(() => {
    const set = new Set(
      spotsAfterLength.value.map((s) => s.sol).filter((s): s is GroundType => s !== null)
    )
    return [...set].sort()
  })

  // --- Reset cascade filters from a given level downward ---
  function resetCascadingFilters(fromLevel: 'service' | 'vehicle' | 'length' | 'ground') {
    if (fromLevel === 'service') {
      selectedVehicleType.value = ''
      selectedVehicleLength.value = null
      selectedGround.value = ''
    } else if (fromLevel === 'vehicle') {
      selectedVehicleLength.value = null
      selectedGround.value = ''
    } else if (fromLevel === 'length') {
      selectedGround.value = ''
    }
  }

  function resetAllCascadeFilters() {
    selectedService.value = ''
    selectedVehicleType.value = ''
    selectedVehicleLength.value = null
    selectedGround.value = ''
  }

  // --- API actions ---

  async function fetchSpots() {
    isLoading.value = true
    error.value = null
    try {
      spots.value = await spotsService.getAll({
        search: searchQuery.value || undefined,
        service: serviceFilter.value || undefined,
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
      await fetchSpots()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la création'
      throw e
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

  return {
    // Raw data
    spots,
    isLoading,
    error,

    // Admin filters
    searchQuery,
    serviceFilter,

    // Cascade filters
    selectedService,
    selectedVehicleType,
    selectedVehicleLength,
    selectedGround,

    // Computed cascades
    searchableSpots,
    filteredSpots,
    availableServices,
    availableVehicleTypes,
    availableGroundTypes,

    // Actions
    resetCascadingFilters,
    resetAllCascadeFilters,
    fetchSpots,
    createSpot,
    updateSpot,
    toggleActive,
  }
})
