<script setup lang="ts">
import { type Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  title: string
  value: string | number
  description?: string
  icon?: Component
  iconClass?: string
}>()
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">{{ title }}</CardTitle>
      <div
        v-if="icon"
        class="flex h-8 w-8 items-center justify-center rounded-lg"
        :class="iconClass || 'bg-primary/10 text-primary'"
      >
        <component :is="icon" class="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold tracking-tight">{{ value }}</div>
      <p v-if="description" class="mt-1 text-xs text-muted-foreground">{{ description }}</p>
    </CardContent>
  </Card>
</template>
