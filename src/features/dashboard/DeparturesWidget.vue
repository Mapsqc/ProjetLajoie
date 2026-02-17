<script setup lang="ts">
import type { ArrivalDeparture } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState.vue'
import { ArrowUpFromLine } from 'lucide-vue-next'

defineProps<{
  departures: ArrivalDeparture[]
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base font-semibold">
        <ArrowUpFromLine class="h-4 w-4 text-amber-600" />
        Departs du jour
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="departures.length" class="divide-y divide-border">
        <div
          v-for="d in departures"
          :key="d.reservationId"
          class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ArrowUpFromLine class="h-3.5 w-3.5" />
            </div>
            <div>
              <p class="text-sm font-medium">{{ d.customerName }}</p>
              <p class="text-xs text-muted-foreground">{{ d.spotName }}</p>
            </div>
          </div>
          <span class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Depart</span>
        </div>
      </div>
      <EmptyState v-else title="Aucun depart" description="Pas de depart prevu aujourd'hui" />
    </CardContent>
  </Card>
</template>
