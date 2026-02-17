<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Reservation, Customer } from '@/types'
import { formatDateShort, isToday, dayjs } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { useSpotsStore } from '@/stores/spots.store'
import { customersService } from '@/services/customers.service'
import BadgeStatus from '@/components/shared/BadgeStatus.vue'
import { ArrowDownToLine, ArrowUpFromLine, CalendarX } from 'lucide-vue-next'

export type ViewMode = 'all' | 'arrivals' | 'departures'

const props = defineProps<{
  reservations: Reservation[]
  viewMode: ViewMode
}>()

const router = useRouter()
const spotsStore = useSpotsStore()
const customers = ref<Customer[]>([])

onMounted(async () => {
  if (spotsStore.spots.length === 0) {
    await spotsStore.fetchSpots()
  }
  customers.value = await customersService.getAll()
})

interface DayGroup {
  date: string
  label: string
  isToday: boolean
  isPast: boolean
  arrivals: Reservation[]
  departures: Reservation[]
}

const groupedByDate = computed<DayGroup[]>(() => {
  const dateMap = new Map<string, { arrivals: Reservation[]; departures: Reservation[] }>()

  for (const r of props.reservations) {
    if (props.viewMode !== 'departures') {
      if (!dateMap.has(r.checkIn)) {
        dateMap.set(r.checkIn, { arrivals: [], departures: [] })
      }
      dateMap.get(r.checkIn)!.arrivals.push(r)
    }

    if (props.viewMode !== 'arrivals') {
      if (!dateMap.has(r.checkOut)) {
        dateMap.set(r.checkOut, { arrivals: [], departures: [] })
      }
      dateMap.get(r.checkOut)!.departures.push(r)
    }
  }

  const groups: DayGroup[] = []
  for (const [date, data] of dateMap.entries()) {
    if (data.arrivals.length === 0 && data.departures.length === 0) continue
    groups.push({
      date,
      label: formatDateShort(date),
      isToday: isToday(date),
      isPast: dayjs(date).isBefore(dayjs(), 'day'),
      arrivals: data.arrivals,
      departures: data.departures,
    })
  }

  return groups.sort((a, b) => a.date.localeCompare(b.date))
})

interface FlatRow {
  reservation: Reservation
  type: 'arrival' | 'departure'
  group: DayGroup
  isFirstInGroup: boolean
  groupRowCount: number
}

const flatRows = computed<FlatRow[]>(() => {
  const rows: FlatRow[] = []
  for (const group of groupedByDate.value) {
    const groupRows: FlatRow[] = []

    const arrivals = props.viewMode !== 'departures' ? group.arrivals : []
    const departures = props.viewMode !== 'arrivals' ? group.departures : []

    for (const r of arrivals) {
      groupRows.push({ reservation: r, type: 'arrival', group, isFirstInGroup: false, groupRowCount: 0 })
    }
    for (const r of departures) {
      groupRows.push({ reservation: r, type: 'departure', group, isFirstInGroup: false, groupRowCount: 0 })
    }

    if (groupRows.length > 0) {
      groupRows[0].isFirstInGroup = true
      groupRows[0].groupRowCount = groupRows.length
    }

    rows.push(...groupRows)
  }
  return rows
})

function getCustomerName(customerId: string): string {
  const c = customers.value.find((c) => c.id === customerId)
  return c ? `${c.firstName} ${c.lastName}` : customerId
}

function getSpotName(spotId: string): string {
  const s = spotsStore.spots.find((s) => s.id === spotId)
  return s?.name ?? spotId
}

function goToDetail(id: string) {
  router.push({ name: 'reservation-detail', params: { id } })
}

function statusBarClass(status: string): string {
  switch (status) {
    case 'CONFIRMED': return 'bg-emerald-500'
    case 'HOLD': return 'bg-yellow-500'
    case 'CANCELLED': return 'bg-red-400'
    case 'EXPIRED': return 'bg-orange-400'
    default: return 'bg-gray-300'
  }
}
</script>

<template>
  <div v-if="flatRows.length" class="overflow-hidden rounded-lg border">
    <table class="w-full table-fixed text-sm">
      <colgroup>
        <col class="w-[110px]" />
        <col class="w-[3px]" />
        <col />
        <col class="w-[120px]" />
        <col class="w-[110px]" />
        <col class="w-[110px]" />
        <col class="w-[90px]" />
        <col class="w-[100px]" />
      </colgroup>
      <thead>
        <tr class="border-b bg-muted/30 text-left text-[11px] text-muted-foreground">
          <th class="py-1 pl-3 pr-2 font-medium">Date</th>
          <th class="px-0" />
          <th class="py-1 pr-2 font-medium">Client</th>
          <th class="py-1 pr-2 font-medium">Emplacement</th>
          <th class="py-1 pr-2 font-medium">Arrivée</th>
          <th class="py-1 pr-2 font-medium">Départ</th>
          <th class="py-1 pr-2 text-right font-medium">Prix</th>
          <th class="py-1 pr-2 text-right font-medium">Statut</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, idx) in flatRows" :key="row.type + '-' + row.reservation.id">
          <!-- Mini spacer between date groups -->
          <tr v-if="row.isFirstInGroup && idx > 0" class="pointer-events-none">
            <td colspan="8" class="h-2 bg-muted/40 border-y border-border/60" />
          </tr>
          <tr
            class="cursor-pointer transition-colors hover:bg-muted/40"
            :class="[
              !row.isFirstInGroup ? 'border-t border-t-border/30' : '',
            ]"
            @click="goToDetail(row.reservation.id)"
          >
          <!-- Date cell (rowspan) -->
          <td
            v-if="row.isFirstInGroup"
            :rowspan="row.groupRowCount"
            class="py-1 pl-3 pr-2 align-top"
            :class="row.group.isToday ? 'bg-primary/5' : 'bg-muted/30'"
          >
            <div
              class="text-xs font-semibold capitalize leading-tight"
              :class="row.group.isToday ? 'text-primary' : row.group.isPast ? 'text-muted-foreground' : 'text-foreground'"
            >
              {{ row.group.label }}
            </div>
            <div v-if="row.group.isToday" class="text-[10px] font-medium text-primary/70">
              Aujourd'hui
            </div>
          </td>

          <!-- Status bar -->
          <td class="px-0 py-1">
            <div
              class="h-full w-[3px] min-h-[20px] rounded-r-full"
              :class="statusBarClass(row.reservation.status)"
            />
          </td>

          <!-- Client -->
          <td class="truncate py-1 pr-2 font-medium">{{ getCustomerName(row.reservation.customerId) }}</td>

          <!-- Spot -->
          <td class="truncate py-1 pr-2 text-muted-foreground">{{ getSpotName(row.reservation.spotId) }}</td>

          <!-- Arrivée -->
          <td class="py-1 pr-2">
            <div class="flex items-center gap-1">
              <ArrowDownToLine
                v-if="row.type === 'arrival'"
                class="h-3 w-3 shrink-0 text-emerald-600"
              />
              <span
                class="text-xs"
                :class="row.type === 'arrival' ? 'text-emerald-700 font-medium' : 'text-muted-foreground'"
              >
                {{ formatDateShort(row.reservation.checkIn) }}
              </span>
            </div>
          </td>

          <!-- Départ -->
          <td class="py-1 pr-2">
            <div class="flex items-center gap-1">
              <ArrowUpFromLine
                v-if="row.type === 'departure'"
                class="h-3 w-3 shrink-0 text-orange-600"
              />
              <span
                class="text-xs"
                :class="row.type === 'departure' ? 'text-orange-700 font-medium' : 'text-muted-foreground'"
              >
                {{ formatDateShort(row.reservation.checkOut) }}
              </span>
            </div>
          </td>

          <!-- Prix -->
          <td class="py-1 pr-2 text-right tabular-nums text-muted-foreground">{{ formatCurrency(row.reservation.totalPrice) }}</td>

          <!-- Statut -->
          <td class="py-1 pr-2 text-right">
            <BadgeStatus :status="row.reservation.status" />
          </td>
        </tr>
        </template>
      </tbody>
    </table>
  </div>

  <!-- Empty state -->
  <div v-else class="flex flex-col items-center justify-center py-20 text-center">
    <CalendarX class="mb-3 h-10 w-10 text-muted-foreground/30" />
    <p class="text-sm font-medium text-muted-foreground">Aucun mouvement ne correspond aux filtres</p>
  </div>
</template>
