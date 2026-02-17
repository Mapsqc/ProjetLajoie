import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Customer } from '@/types'
import { customersService } from '@/services/customers.service'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  async function fetchCustomers() {
    isLoading.value = true
    error.value = null
    try {
      const allCustomers = await customersService.getAll()
      // Filtrer localement si nécessaire
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        customers.value = allCustomers.filter(
          (c) =>
            c.firstName.toLowerCase().includes(query) ||
            c.lastName.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
        )
      } else {
        customers.value = allCustomers
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement'
    } finally {
      isLoading.value = false
    }
  }

  async function createCustomer(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }) {
    try {
      await customersService.create(data)
      await fetchCustomers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur lors de la création'
      throw e
    }
  }

  return { customers, isLoading, error, searchQuery, fetchCustomers, createCustomer }
})
