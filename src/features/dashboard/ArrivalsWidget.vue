<script setup lang="ts">
import type { ArrivalDeparture } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BadgeStatus from '@/components/shared/BadgeStatus.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { ArrowDownToLine } from 'lucide-vue-next'

defineProps<{
  arrivals: ArrivalDeparture[]
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base font-semibold">
        <ArrowDownToLine class="h-4 w-4 text-emerald-600" />
        Arrivees du jour
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="arrivals.length" class="divide-y divide-border">
        <div
          v-for="a in arrivals"
          :key="a.reservationId"
          class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ArrowDownToLine class="h-3.5 w-3.5" />
            </div>
            <div>
              <p class="text-sm font-medium">{{ a.customerName }}</p>
              <p class="text-xs text-muted-foreground">{{ a.spotName }}</p>
            </div>
          </div>
          <BadgeStatus :status="a.status" />
        </div>
      </div>
      <EmptyState v-else title="Aucune arrivee" description="Pas d'arrivee prevue aujourd'hui" />
    </CardContent>
  </Card>
</template>
