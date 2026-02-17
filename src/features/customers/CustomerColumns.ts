import type { ColumnDef } from '@tanstack/vue-table'
import type { Customer } from '@/types'
import { h } from 'vue'
import CustomerRowActions from '@/features/customers/CustomerRowActions.vue'

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'firstName',
    header: 'Prénom',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('firstName')),
  },
  {
    accessorKey: 'lastName',
    header: 'Nom',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('lastName')),
  },
  {
    accessorKey: 'email',
    header: 'Courriel',
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.getValue('email')),
  },
  {
    accessorKey: 'phone',
    header: 'Téléphone',
    cell: ({ row }) => h('span', { class: 'text-muted-foreground' }, row.getValue('phone')),
  },
  {
    id: 'location',
    header: 'Ville',
    cell: ({ row }) => {
      const customer = row.original
      if (customer.city && customer.province) {
        return h('span', { class: 'text-muted-foreground' }, `${customer.city}, ${customer.province}`)
      }
      return h('span', { class: 'text-muted-foreground text-xs' }, '—')
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h(CustomerRowActions, { customer: row.original }),
  },
]
