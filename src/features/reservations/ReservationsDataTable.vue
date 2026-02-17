<script setup lang="ts">
import {
  useVueTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  FlexRender,
  type SortingState,
} from '@tanstack/vue-table'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Reservation, Spot, Customer } from '@/types'
import { createReservationColumns } from './ReservationColumns'
import { useSpotsStore } from '@/stores/spots.store'
import { customersService } from '@/services/customers.service'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DataTablePagination from '@/components/shared/DataTablePagination.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const props = defineProps<{
  reservations: Reservation[]
  spots?: Spot[]
  customers?: Customer[]
}>()

const router = useRouter()
const spotsStore = useSpotsStore()
const sorting = ref<SortingState>([])
const customers = ref<Customer[]>([])

// Use provided spots/customers or fallback to store/service
const spots = computed(() => props.spots ?? spotsStore.spots)
const customersList = computed(() => props.customers ?? customers.value)

// Load customers if not provided
if (!props.customers) {
  customersService.getAll().then((data) => {
    customers.value = data
  })
}

const reservationColumns = computed(() => createReservationColumns(spots.value, customersList.value))

const table = useVueTable({
  get data() {
    return props.reservations
  },
  get columns() {
    return reservationColumns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  initialState: {
    pagination: { pageSize: 10 },
  },
})

function handleRowClick(reservation: Reservation) {
  router.push({ name: 'reservation-detail', params: { id: reservation.id } })
}
</script>

<template>
  <div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="handleRowClick(row.original)"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="table.getHeaderGroups()[0]?.headers.length ?? 7" class="h-24">
                <EmptyState title="Aucune reservation" description="Aucune reservation trouvee avec ces filtres" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
    <DataTablePagination :table="(table as any)" />
  </div>
</template>
