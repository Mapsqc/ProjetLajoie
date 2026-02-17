<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useReservationsStore } from '@/stores/reservations.store'
import { useSpotsStore } from '@/stores/spots.store'
import type { ReservationStatus } from '@/types'
import type { ViewMode } from '@/features/reservations/ReservationDayTimeline.vue'
import { getMonthLabel } from '@/utils/date'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ReservationDayTimeline from '@/features/reservations/ReservationDayTimeline.vue'
import MonthGrid from '@/features/calendar/MonthGrid.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ReservationFormDialog from '@/features/reservations/ReservationFormDialog.vue'
import {
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-vue-next'

type DisplayMode = 'list' | 'calendar'

const showCreateDialog = ref(false)
const reservationsStore = useReservationsStore()
const spotsStore = useSpotsStore()
const viewMode = ref<ViewMode>('all')
const displayMode = ref<DisplayMode>('list')

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const monthLabel = computed(() => getMonthLabel(currentYear.value, currentMonth.value))

const activeSpots = computed(() => spotsStore.spots.filter((s) => s.isActive))

onMounted(async () => {
  await Promise.all([
    reservationsStore.fetchReservations(),
    spotsStore.fetchSpots(),
  ])
})

function handleStatusChange(val: unknown) {
  const strVal = typeof val === 'string' ? val : String(val ?? '')
  const value = strVal === 'ALL' ? '' : strVal
  reservationsStore.statusFilter = value as ReservationStatus | ''
  reservationsStore.fetchReservations()
}

function setViewMode(mode: ViewMode) {
  viewMode.value = mode
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToToday() {
  currentYear.value = new Date().getFullYear()
  currentMonth.value = new Date().getMonth()
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Reservations" description="Arrivees et departs par date">
      <template #actions>
        <Button size="sm" class="gap-1.5" @click="showCreateDialog = true">
          <Plus class="h-4 w-4" />
          Ajouter
        </Button>

        <!-- Display mode toggle: List / Calendar -->
        <div class="flex items-center rounded-lg border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            class="h-7 gap-1.5 rounded-md px-2.5 text-xs"
            :class="displayMode === 'list' ? 'bg-muted font-medium' : 'text-muted-foreground'"
            @click="displayMode = 'list'"
          >
            <List class="h-3.5 w-3.5" />
            Liste
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 gap-1.5 rounded-md px-2.5 text-xs"
            :class="displayMode === 'calendar' ? 'bg-muted font-medium' : 'text-muted-foreground'"
            @click="displayMode = 'calendar'"
          >
            <CalendarDays class="h-3.5 w-3.5" />
            Calendrier
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- List mode toolbar -->
    <div v-if="displayMode === 'list'" class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="relative min-w-[200px] max-w-xs flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="reservationsStore.searchQuery"
          placeholder="Client, emplacement..."
          class="pl-9"
          @input="reservationsStore.fetchReservations()"
        />
      </div>

      <!-- Status filter -->
      <Select :model-value="reservationsStore.statusFilter || 'ALL'" @update:model-value="handleStatusChange">
        <SelectTrigger class="w-44">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les statuts</SelectItem>
          <SelectItem value="CONFIRMED">Confirmee</SelectItem>
          <SelectItem value="HOLD">En attente</SelectItem>
          <SelectItem value="CANCELLED">Annulee</SelectItem>
        </SelectContent>
      </Select>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Arrivals / Departures toggle -->
      <div class="flex items-center rounded-lg border p-0.5">
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 rounded-md px-2.5 text-xs"
          :class="viewMode === 'all' ? 'bg-muted font-medium' : 'text-muted-foreground'"
          @click="setViewMode('all')"
        >
          <ArrowLeftRight class="h-3.5 w-3.5" />
          Tout
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 rounded-md px-2.5 text-xs"
          :class="viewMode === 'arrivals' ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-muted-foreground'"
          @click="setViewMode('arrivals')"
        >
          <ArrowDownToLine class="h-3.5 w-3.5" />
          Arrivees
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1.5 rounded-md px-2.5 text-xs"
          :class="viewMode === 'departures' ? 'bg-orange-50 font-medium text-orange-700' : 'text-muted-foreground'"
          @click="setViewMode('departures')"
        >
          <ArrowUpFromLine class="h-3.5 w-3.5" />
          Departs
        </Button>
      </div>
    </div>

    <!-- Calendar mode toolbar -->
    <div v-if="displayMode === 'calendar'" class="flex items-center gap-2">
      <Button variant="outline" size="icon" class="h-8 w-8" @click="prevMonth">
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" class="h-8 text-xs" @click="goToToday">
        Aujourd'hui
      </Button>
      <span class="min-w-[150px] text-center text-sm font-medium capitalize">
        {{ monthLabel }}
      </span>
      <Button variant="outline" size="icon" class="h-8 w-8" @click="nextMonth">
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <!-- Content -->
    <LoadingSpinner v-if="reservationsStore.isLoading" />

    <template v-else>
      <!-- List view -->
      <ReservationDayTimeline
        v-if="displayMode === 'list'"
        :reservations="reservationsStore.reservations"
        :view-mode="viewMode"
      />

      <!-- Calendar view -->
      <MonthGrid
        v-else
        :year="currentYear"
        :month="currentMonth"
        :spots="activeSpots"
        :reservations="reservationsStore.reservations"
      />
    </template>

    <ReservationFormDialog v-model:open="showCreateDialog" />
  </div>
</template>
