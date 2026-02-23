import type { Customer } from '@/types'
import { apiGet, apiPost } from './api-client'

export const customersService = {
  async getAll(): Promise<Customer[]> {
    return apiGet<Customer[]>('/api/admin/customers')
  },

  async create(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }): Promise<Customer> {
    return apiPost<Customer>('/api/admin/customers', data)
  },
}
