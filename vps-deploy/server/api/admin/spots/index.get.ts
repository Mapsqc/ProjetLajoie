function mapSpot(r: Record<string, unknown>) {
  return {
    id: r.id,
    number: r.number,
    service: r.service,
    status: r.status,
    pricePerNight: r.price_per_night,
    isActive: r.is_active === 1,
    longueur: r.longueur ?? null,
    largeur: r.largeur ?? null,
    soleil: r.soleil ?? null,
    motoriseRange: r.motorise_range_max != null ? { min: r.motorise_range_min, max: r.motorise_range_max } : null,
    fifthwheelRange: r.fifthwheel_range_max != null ? { min: r.fifthwheel_range_min, max: r.fifthwheel_range_max } : null,
    roulotteRange: r.roulotte_range_max != null ? { min: r.roulotte_range_min, max: r.roulotte_range_max } : null,
    campeurPorte: (r.campeur_porte as number) === 1,
    tenteRoulotte: (r.tente_roulotte as number) === 1,
    tente: (r.tente as number) === 1,
    sol: r.sol ?? null,
    particularite: r.particularite ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export default defineEventHandler((event) => {
  requireAdminAuth(event)

  const query = getQuery(event)
  const db = useDb()

  let sql = 'SELECT * FROM spots'
  const conditions: string[] = []
  const params: unknown[] = []

  if (query.search) {
    conditions.push('(CAST(number AS TEXT) LIKE ? OR particularite LIKE ?)')
    params.push(`%${query.search}%`, `%${query.search}%`)
  }
  if (query.service) {
    conditions.push('service = ?')
    params.push(query.service)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }
  sql += ' ORDER BY number'

  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[]
  return rows.map(mapSpot)
})
