import { z } from 'zod'

const CreateSpotSchema = z.object({
  number: z.number().int().min(1),
  service: z.enum(['EEE', 'EEE50', 'EE', 'NAT', 'CHALET']),
  status: z.enum(['REGULAR', 'SEASONAL', 'BACKUP', 'GROUP']),
  pricePerNight: z.number().min(0),
  isActive: z.boolean(),
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

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)

  const body = await readBody(event)
  const parsed = CreateSpotSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const data = parsed.data
  const db = useDb()
  const id = `spot-${data.number}`
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO spots (
      id, number, service, status, price_per_night, is_active,
      longueur, largeur, soleil,
      motorise_range_min, motorise_range_max,
      fifthwheel_range_min, fifthwheel_range_max,
      roulotte_range_min, roulotte_range_max,
      campeur_porte, tente_roulotte, tente,
      sol, particularite,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.number, data.service, data.status, data.pricePerNight,
    data.isActive ? 1 : 0,
    data.longueur ?? null, data.largeur ?? null, data.soleil ?? null,
    data.motoriseRange?.min ?? null, data.motoriseRange?.max ?? null,
    data.fifthwheelRange?.min ?? null, data.fifthwheelRange?.max ?? null,
    data.roulotteRange?.min ?? null, data.roulotteRange?.max ?? null,
    data.campeurPorte ? 1 : 0, data.tenteRoulotte ? 1 : 0, data.tente ? 1 : 0,
    data.sol ?? null, data.particularite ?? null,
    now, now,
  )

  return {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  }
})
