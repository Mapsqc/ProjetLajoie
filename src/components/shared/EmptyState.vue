<script setup lang="ts">
import { type Component } from 'vue'
import { Inbox } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <component :is="icon || Inbox" class="mb-4 h-12 w-12 text-muted-foreground/50" />
    <h3 class="text-lg font-medium text-foreground">{{ title }}</h3>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
