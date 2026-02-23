import type { ColumnDef } from '@tanstack/vue-table'
import type { Spot } from '@/types'
import { SERVICE_LABELS, STATUS_LABELS } from '@/types'
import { h } from 'vue'
import { formatCurrency } from '@/utils/format'
import SpotRowActions from '@/features/spots/SpotRowActions.vue'
import { Badge } from '@/components/ui/badge'
import { spotAcceptsVehicleType } from '@/utils/spot-filters'
import type { VehicleType } from '@/types'

const vehicleAbbreviations: Record<VehicleType, string> = {
  MOTORISE: 'Mot',
  FIFTHWHEEL: 'FW',
  ROULOTTE: 'Rou',
  CAMPEUR_PORTE: 'CP',
  TENTE_ROULOTTE: 'TR',
  TENTE: 'T',
}

const allVehicleTypes: VehicleType[] = [
  'MOTORISE',
  'FIFTHWHEEL',
  'ROULOTTE',
  'CAMPEUR_PORTE',
  'TENTE_ROULOTTE',
  'TENTE',
]

const statusVariant: Record<string, string> = {
  REGULAR: 'text-emerald-600',
  SEASONAL: 'text-blue-600',
  BACKUP: 'text-orange-500',
  GROUP: 'text-purple-600',
}

export const spotColumns: ColumnDef<Spot>[] = [
  {
    accessorKey: 'number',
    header: '#',
    cell: ({ row }) => h('span', { class: 'font-medium' }, `#${row.getValue('number')}`),
  },
  {
    accessorKey: 'service',
    header: 'Service',
    cell: ({ row }) =>
      h(Badge, { variant: 'outline' }, () => SERVICE_LABELS[row.getValue('service') as Spot['service']] || row.getValue('service')),
  },
  {
    accessorKey: 'status',
    header: 'Catégorie',
    cell: ({ row }) => {
      const status = row.getValue('status') as Spot['status']
      const cls = statusVariant[status] || ''
      return h('span', { class: `text-sm font-medium ${cls}` }, STATUS_LABELS[status] || status)
    },
  },
  {
    id: 'dimensions',
    header: 'Dimensions (pi)',
    cell: ({ row }) => {
      const l = row.original.longueur
      const w = row.original.largeur
      if (l && w) return `${l} x ${w}`
      if (l) return `${l} pi`
      return '—'
    },
  },
  {
    id: 'vehicles',
    header: 'Véhicules',
    cell: ({ row }) => {
      const abbrs = allVehicleTypes
        .filter((vt) => spotAcceptsVehicleType(row.original, vt))
        .map((vt) => vehicleAbbreviations[vt])
      if (abbrs.length === 0) return h('span', { class: 'text-muted-foreground text-xs' }, '—')
      return h('span', { class: 'text-xs' }, abbrs.join(', '))
    },
  },
  {
    accessorKey: 'pricePerNight',
    header: 'Prix/nuit',
    cell: ({ row }) => formatCurrency(row.getValue('pricePerNight')),
  },
  {
    accessorKey: 'isActive',
    header: 'Actif',
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
