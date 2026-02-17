<script setup lang="ts">
import { ref } from 'vue'
import type { Customer } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CustomerFormDialog from './CustomerFormDialog.vue'
import { MoreHorizontal, Pencil } from 'lucide-vue-next'

const props = defineProps<{
  customer: Customer
}>()

const showEditDialog = ref(false)
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
    </DropdownMenuContent>
  </DropdownMenu>

  <CustomerFormDialog v-model:open="showEditDialog" :customer="props.customer" />
</template>
