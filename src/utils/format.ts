export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

export function truncateId(id: string, length = 8): string {
  return id.length > length ? id.substring(0, length) + '...' : id
}
