const SERVICE_LABELS: Record<string, string> = {
  EEE: '3 services (30A)',
  EEE50: '3 services (50A)',
  EE: '2 services',
  NAT: 'Nature',
  CHALET: 'Chalet',
}

const GROUND_LABELS: Record<string, string> = {
  GRAVEL: 'Gravier',
  SABLE: 'Sable',
  GRAVEL_GAZON: 'Gravier/Gazon',
  GRAVEL_SABLE: 'Gravier/Sable',
  ASPHALTE: 'Asphalte',
  GAZON: 'Gazon',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const checkIn = query.checkIn as string
  const checkOut = query.checkOut as string
  const service = query.service as string | undefined
  const vehicleType = query.vehicleType as string | undefined
  const vehicleLength = query.vehicleLength ? Number(query.vehicleLength) : undefined

  if (!checkIn || !checkOut) {
    throw createError({ statusCode: 400, message: 'checkIn and checkOut are required' })
  }

  const db = useDb()

  // Only show REGULAR + active spots to public search (no SEASONAL/BACKUP/GROUP)
  let sql = `
    SELECT * FROM spots
    WHERE is_active = 1
      AND status = 'REGULAR'
  `
  const params: any[] = []

  // Filter by service type
  if (service) {
    sql += ` AND service = ?`
    params.push(service)
  }

  // Filter by vehicle type and length
  if (vehicleType) {
    switch (vehicleType) {
      case 'MOTORISE':
        sql += ` AND motorise_range_max IS NOT NULL`
        if (vehicleLength) {
          sql += ` AND motorise_range_min <= ? AND motorise_range_max >= ?`
          params.push(vehicleLength, vehicleLength)
        }
        break
      case 'FIFTHWHEEL':
        sql += ` AND fifthwheel_range_max IS NOT NULL`
        if (vehicleLength) {
          sql += ` AND fifthwheel_range_min <= ? AND fifthwheel_range_max >= ?`
          params.push(vehicleLength, vehicleLength)
        }
        break
      case 'ROULOTTE':
        sql += ` AND roulotte_range_max IS NOT NULL`
        if (vehicleLength) {
          sql += ` AND roulotte_range_min <= ? AND roulotte_range_max >= ?`
          params.push(vehicleLength, vehicleLength)
        }
        break
      case 'CAMPEUR_PORTE':
        sql += ` AND campeur_porte = 1`
        break
      case 'TENTE_ROULOTTE':
        sql += ` AND tente_roulotte = 1`
        break
      case 'TENTE':
        sql += ` AND tente = 1`
        break
    }
  }

  sql += ` ORDER BY number ASC`

  const spots = db.prepare(sql).all(...params) as any[]

  // Exclude spots that already have a confirmed reservation overlapping the requested dates
  const reservedSpotIds = db.prepare(`
    SELECT DISTINCT spot_id FROM reservations
    WHERE status IN ('CONFIRMED', 'HOLD')
      AND check_in < ?
      AND check_out > ?
  `).all(checkOut, checkIn) as { spot_id: string }[]

  const reservedSet = new Set(reservedSpotIds.map((r) => r.spot_id))

  const availableSpots = spots
    .filter((s) => !reservedSet.has(s.id))
    .map((s) => ({
      id: s.id,
      number: s.number,
      service: s.service,
      serviceLabel: SERVICE_LABELS[s.service] || s.service,
      pricePerNight: s.price_per_night,
      longueur: s.longueur,
      largeur: s.largeur,
      soleil: s.soleil,
      sol: s.sol,
      solLabel: s.sol ? (GROUND_LABELS[s.sol] || s.sol) : null,
      particularite: s.particularite,
      // Vehicle compatibility
      motorise: s.motorise_range_max != null ? { min: s.motorise_range_min, max: s.motorise_range_max } : null,
      fifthwheel: s.fifthwheel_range_max != null ? { min: s.fifthwheel_range_min, max: s.fifthwheel_range_max } : null,
      roulotte: s.roulotte_range_max != null ? { min: s.roulotte_range_min, max: s.roulotte_range_max } : null,
      campeurPorte: !!s.campeur_porte,
      tenteRoulotte: !!s.tente_roulotte,
      tente: !!s.tente,
    }))

  // Calculate nights
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  const nights = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))

  return {
    spots: availableSpots,
    nights,
  }
})
