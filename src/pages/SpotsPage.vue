<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSpotsStore } from '@/stores/spots.store'
import { SERVICE_LABELS } from '@/types'
import type { SpotService } from '@/types'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import SpotsDataTable from '@/features/spots/SpotsDataTable.vue'
import SpotFormDialog from '@/features/spots/SpotFormDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search } from 'lucide-vue-next'

const spotsStore = useSpotsStore()
const showCreateDialog = ref(false)

onMounted(() => {
  spotsStore.fetchSpots()
})

watch([() => spotsStore.searchQuery, () => spotsStore.serviceFilter], () => {
  spotsStore.fetchSpots()
}, { debounce: 300 } as any)

function handleServiceChange(val: unknown) {
  const strVal = typeof val === 'string' ? val : String(val ?? '')
  const value = strVal === 'ALL' ? '' : strVal
  spotsStore.serviceFilter = value as SpotService | ''
  spotsStore.fetchSpots()
}

const serviceOptions = Object.entries(SERVICE_LABELS) as [SpotService, string][]
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Emplacements" description="Gérez les emplacements du camping">
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
          v-model="spotsStore.searchQuery"
          placeholder="Rechercher un emplacement..."
          class="pl-9"
          @input="spotsStore.fetchSpots()"
        />
      </div>
      <Select :model-value="spotsStore.serviceFilter || 'ALL'" @update:model-value="handleServiceChange">
        <SelectTrigger class="w-52">
          <SelectValue placeholder="Service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les services</SelectItem>
          <SelectItem v-for="[val, label] in serviceOptions" :key="val" :value="val">
            {{ label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <LoadingSpinner v-if="spotsStore.isLoading" />
    <SpotsDataTable v-else :spots="spotsStore.spots" />

    <SpotFormDialog v-model:open="showCreateDialog" />
  </div>
</template>
