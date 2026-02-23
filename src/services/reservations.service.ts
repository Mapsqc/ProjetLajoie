import type { Reservation } from '@/types'
import { apiGet, apiPost, apiPatch } from './api-client'

export interface ReservationFilters {
  status?: string
  search?: string
}

export const reservationsService = {
  async getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    const params: Record<string, string> = {}
    if (filters?.status) params.status = filters.status
    if (filters?.search) params.search = filters.search
    return apiGet<Reservation[]>('/api/admin/reservations', params)
  },

  async getById(id: string): Promise<Reservation> {
    return apiGet<Reservation>(`/api/admin/reservations/${id}`)
  },

  async create(data: {
    spotId: string
    customerId: string
    checkIn: string
    checkOut: string
    adultsCount: number
    childrenCount: number
    totalPrice: number
  }): Promise<Reservation> {
    return apiPost<Reservation>('/api/admin/reservations', data)
  },

  async updateReservation(id: string, data: {
    spotId: string
    customerId: string
    checkIn: string
    checkOut: string
    adultsCount: number
    childrenCount: number
    status: 'CONFIRMED' | 'HOLD'
  }): Promise<Reservation> {
    return apiPatch<Reservation>(`/api/admin/reservations/${id}`, data)
  },

  async updateDates(id: string, checkIn: string, checkOut: string): Promise<Reservation> {
    return apiPatch<Reservation>(`/api/admin/reservations/${id}/dates`, { checkIn, checkOut })
  },

  async reassignSpot(id: string, spotId: string): Promise<Reservation> {
    return apiPatch<Reservation>(`/api/admin/reservations/${id}/spot`, { spotId })
  },

  async addNote(id: string, text: string): Promise<Reservation> {
    return apiPost<Reservation>(`/api/admin/reservations/${id}/notes`, { text })
  },

  async cancel(id: string): Promise<Reservation> {
    return apiPost<Reservation>(`/api/admin/reservations/${id}/cancel`)
  },

  async confirm(id: string): Promise<Reservation> {
    return apiPost<Reservation>(`/api/admin/reservations/${id}/confirm`)
  },

  async hold(id: string): Promise<Reservation> {
    return apiPost<Reservation>(`/api/admin/reservations/${id}/hold`)
  },
}
