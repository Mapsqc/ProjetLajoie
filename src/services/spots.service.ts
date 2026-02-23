import type { Spot, SpotFormData, SpotService, SpotStatus, GroundType, VehicleType } from '@/types'
import { apiGet, apiPost, apiPatch } from './api-client'

export interface SpotFilters {
  search?: string
  service?: SpotService
  vehicleType?: VehicleType
  vehicleLength?: number
  sol?: GroundType
  status?: SpotStatus
  searchableOnly?: boolean
}

export const spotsService = {
  async getAll(filters?: SpotFilters): Promise<Spot[]> {
    const params: Record<string, string> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.service) params.service = filters.service
    if (filters?.vehicleType) params.vehicleType = filters.vehicleType
    if (filters?.vehicleLength) params.vehicleLength = String(filters.vehicleLength)
    if (filters?.sol) params.sol = filters.sol
    if (filters?.status) params.status = filters.status
    if (filters?.searchableOnly) params.searchableOnly = 'true'
    return apiGet<Spot[]>('/api/admin/spots', params)
  },

  async create(data: SpotFormData): Promise<Spot> {
    return apiPost<Spot>('/api/admin/spots', data)
  },

  async update(id: string, data: Partial<SpotFormData>): Promise<Spot> {
    return apiPatch<Spot>(`/api/admin/spots/${id}`, data)
  },

  async toggleActive(id: string): Promise<Spot> {
    return apiPost<Spot>(`/api/admin/spots/${id}/toggle-active`)
  },
}
