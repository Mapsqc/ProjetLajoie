import { z } from 'zod'

const UpdateSpotSchema = z.object({
  number: z.number().int().min(1).optional(),
  service: z.enum(['EEE', 'EEE50', 'EE', 'NAT', 'CHALET']).optional(),
  status: z.enum(['REGULAR', 'SEASONAL', 'BACKUP', 'GROUP']).optional(),
  pricePerNight: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  longueur: z.number().nullable().optional(),
  largeur: z.number().nullable().optional(),
  soleil: z.number().nullable().optional(),
  motoriseRange: z.object({ min: z.number(), max: z.number() }).nullable().optional(),
  fifthwheelRange: z.object({ min: z.number(), max: z.number() }).nullable().optional(),
  roulotteRange: z.object({ min: z.number(), max: z.number() }).nullable().optional(),
  campeurPorte: z.boolean().optional(),
  tenteRoulotte: z.boolean().optional(),
  tente: z.boolean().optional(),
  sol: z.enum(['GRAVEL', 'SABLE', 'GRAVEL_GAZON', 'GRAVEL_SABLE', 'ASPHALTE', 'GAZON']).nullable().optional(),
  particularite: z.string().nullable().optional(),
})

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

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body = await readBody(event)
  const parsed = UpdateSpotSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const data = parsed.data
  const db = useDb()
  const now = new Date().toISOString()

  const sets: string[] = []
  const params: unknown[] = []

  if (data.number !== undefined) { sets.push('number = ?'); params.push(data.number) }
  if (data.service !== undefined) { sets.push('service = ?'); params.push(data.service) }
  if (data.status !== undefined) { sets.push('status = ?'); params.push(data.status) }
  if (data.pricePerNight !== undefined) { sets.push('price_per_night = ?'); params.push(data.pricePerNight) }
  if (data.isActive !== undefined) { sets.push('is_active = ?'); params.push(data.isActive ? 1 : 0) }
  if (data.longueur !== undefined) { sets.push('longueur = ?'); params.push(data.longueur) }
  if (data.largeur !== undefined) { sets.push('largeur = ?'); params.push(data.largeur) }
  if (data.soleil !== undefined) { sets.push('soleil = ?'); params.push(data.soleil) }
  if (data.motoriseRange !== undefined) {
    sets.push('motorise_range_min = ?', 'motorise_range_max = ?')
    params.push(data.motoriseRange?.min ?? null, data.motoriseRange?.max ?? null)
  }
  if (data.fifthwheelRange !== undefined) {
    sets.push('fifthwheel_range_min = ?', 'fifthwheel_range_max = ?')
    params.push(data.fifthwheelRange?.min ?? null, data.fifthwheelRange?.max ?? null)
  }
  if (data.roulotteRange !== undefined) {
    sets.push('roulotte_range_min = ?', 'roulotte_range_max = ?')
    params.push(data.roulotteRange?.min ?? null, data.roulotteRange?.max ?? null)
  }
  if (data.campeurPorte !== undefined) { sets.push('campeur_porte = ?'); params.push(data.campeurPorte ? 1 : 0) }
  if (data.tenteRoulotte !== undefined) { sets.push('tente_roulotte = ?'); params.push(data.tenteRoulotte ? 1 : 0) }
  if (data.tente !== undefined) { sets.push('tente = ?'); params.push(data.tente ? 1 : 0) }
  if (data.sol !== undefined) { sets.push('sol = ?'); params.push(data.sol) }
  if (data.particularite !== undefined) { sets.push('particularite = ?'); params.push(data.particularite) }

  if (sets.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  sets.push('updated_at = ?')
  params.push(now)
  params.push(id)

  db.prepare(`UPDATE spots SET ${sets.join(', ')} WHERE id = ?`).run(...params)

  const row = db.prepare('SELECT * FROM spots WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Emplacement introuvable' })

  return mapSpot(row)
})
