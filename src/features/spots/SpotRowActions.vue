<script setup lang="ts">
import { ref } from 'vue'
import type { Spot } from '@/types'
import { useSpotsStore } from '@/stores/spots.store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import SpotFormDialog from './SpotFormDialog.vue'
import { MoreHorizontal, Pencil, Power } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  spot: Spot
}>()

const spotsStore = useSpotsStore()
const showEditDialog = ref(false)

async function handleToggleActive() {
  try {
    await spotsStore.toggleActive(props.spot.id)
    toast.success(props.spot.isActive ? 'Emplacement desactive' : 'Emplacement active')
  } catch {
    toast.error('Erreur lors de la modification')
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="h-8 w-8">
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="showEditDialog = true" class="cursor-pointer">
        <Pencil class="mr-2 h-4 w-4" />
        Modifier
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleToggleActive" class="cursor-pointer">
        <Power class="mr-2 h-4 w-4" />
        {{ spot.isActive ? 'Desactiver' : 'Activer' }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <SpotFormDialog v-model:open="showEditDialog" :spot="spot" />
</template>
