<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useCustomersStore } from '@/stores/customers.store'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import CustomersDataTable from '@/features/customers/CustomersDataTable.vue'
import CustomerFormDialog from '@/features/customers/CustomerFormDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-vue-next'

const customersStore = useCustomersStore()
const showCreateDialog = ref(false)

onMounted(() => {
  customersStore.fetchCustomers()
})

watch(() => customersStore.searchQuery, () => {
  customersStore.fetchCustomers()
}, { debounce: 300 } as any)
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Clients" description="Gérez les clients du camping">
      <template #actions>
        <Button @click="showCreateDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </template>
    </PageHeader>

    <!-- Toolbar -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="customersStore.searchQuery"
          placeholder="Rechercher un client..."
          class="pl-9"
          @input="customersStore.fetchCustomers()"
        />
      </div>
    </div>

    <LoadingSpinner v-if="customersStore.isLoading" />
    <CustomersDataTable v-else :customers="customersStore.customers" />

    <CustomerFormDialog v-model:open="showCreateDialog" />
  </div>
</template>
