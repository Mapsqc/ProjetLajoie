import type { ColumnDef } from '@tanstack/vue-table'
import type { Spot } from '@/types'
import { h } from 'vue'
import { formatCurrency } from '@/utils/format'
import SpotRowActions from '@/features/spots/SpotRowActions.vue'
import { Badge } from '@/components/ui/badge'
import { Zap, Droplets } from 'lucide-vue-next'

const typeLabels: Record<string, string> = {
  TENT: 'Tente',
  RV: 'VR',
  CABIN: 'Chalet',
}

export const spotColumns: ColumnDef<Spot>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.getValue('name')),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => h(Badge, { variant: 'outline' }, () => typeLabels[row.getValue('type') as string] || row.getValue('type')),
  },
  {
    accessorKey: 'capacity',
    header: 'Capacite',
    cell: ({ row }) => `${row.getValue('capacity')} pers.`,
  },
  {
    accessorKey: 'pricePerNight',
    header: 'Prix/nuit',
    cell: ({ row }) => formatCurrency(row.getValue('pricePerNight')),
  },
  {
    id: 'services',
    header: 'Services',
    cell: ({ row }) => {
      const icons = []
      if (row.original.hasElectricity) icons.push(h(Zap, { class: 'h-4 w-4 text-yellow-500' }))
      if (row.original.hasWater) icons.push(h(Droplets, { class: 'h-4 w-4 text-blue-500' }))
      return h('div', { class: 'flex gap-1' }, icons.length ? icons : [h('span', { class: 'text-muted-foreground text-xs' }, '—')])
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Statut',
    cell: ({ row }) =>
      h(
        'span',
        { class: row.original.isActive ? 'text-emerald-600 text-sm font-medium' : 'text-red-500 text-sm font-medium' },
        row.original.isActive ? 'Actif' : 'Inactif'
      ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h(SpotRowActions, { spot: row.original }),
  },
]
