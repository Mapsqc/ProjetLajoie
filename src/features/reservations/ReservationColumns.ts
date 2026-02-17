import type { ColumnDef } from '@tanstack/vue-table'
import type { Reservation, Spot, Customer } from '@/types'
import { h } from 'vue'
import { formatDateShort } from '@/utils/date'
import { formatCurrency, truncateId } from '@/utils/format'
import BadgeStatus from '@/components/shared/BadgeStatus.vue'

export function createReservationColumns(
  spots: Spot[],
  customers: Customer[]
): ColumnDef<Reservation>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => h('span', { class: 'font-mono text-xs' }, truncateId(row.getValue('id'))),
    },
    {
      id: 'customer',
      header: 'Client',
      cell: ({ row }) => {
        const customer = customers.find((c) => c.id === row.original.customerId)
        return customer ? `${customer.firstName} ${customer.lastName}` : row.original.customerId
      },
    },
    {
      id: 'spot',
      header: 'Emplacement',
      cell: ({ row }) => {
        const spot = spots.find((s) => s.id === row.original.spotId)
        return spot?.name ?? row.original.spotId
      },
    },
    {
      accessorKey: 'checkIn',
      header: 'Arrivee',
      cell: ({ row }) => formatDateShort(row.getValue('checkIn')),
    },
    {
      accessorKey: 'checkOut',
      header: 'Depart',
      cell: ({ row }) => formatDateShort(row.getValue('checkOut')),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.getValue('totalPrice')),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => h(BadgeStatus, { status: row.getValue('status') as Reservation['status'] }),
    },
  ]
}
