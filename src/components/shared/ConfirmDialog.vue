<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="emit('update:open', false)" :disabled="loading">
          Annuler
        </Button>
        <Button
          :variant="destructive ? 'destructive' : 'default'"
          @click="emit('confirm')"
          :disabled="loading"
        >
          {{ loading ? 'En cours...' : (confirmLabel || 'Confirmer') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
