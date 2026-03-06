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

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const db = useDb()
  const now = new Date().toISOString()

  db.prepare(
    'UPDATE spots SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?'
  ).run(now, id)

  const row = db.prepare('SELECT * FROM spots WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Emplacement introuvable' })

  return mapSpot(row)
})
