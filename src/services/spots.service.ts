import { SpotFormSchema, type Spot, type SpotFormData } from '@/types'
import { getDb } from './database'

export interface SpotFilters {
  search?: string
  type?: string
}

function generateId(): string {
  return `sp-${crypto.randomUUID().slice(0, 8)}`
}

interface SpotRow {
  id: string
  name: string
  type: string
  capacity: number
  price_per_night: number
  has_electricity: number
  has_water: number
  has_sewer: number
  size: number
  is_active: number
  description: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: SpotRow): Spot {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Spot['type'],
    capacity: row.capacity,
    pricePerNight: row.price_per_night,
    hasElectricity: row.has_electricity === 1,
    hasWater: row.has_water === 1,
    hasSewer: row.has_sewer === 1,
    size: row.size,
    isActive: row.is_active === 1,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const spotsService = {
  async getAll(filters?: SpotFilters): Promise<Spot[]> {
    const db = await getDb()
    let query = 'SELECT * FROM spots'
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (filters?.search) {
      conditions.push(`name LIKE $${paramIndex}`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }
    if (filters?.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY name'

    const rows = await db.select<SpotRow[]>(query, params)
    return rows.map(mapRow)
  },

  async create(data: SpotFormData): Promise<Spot> {
    const validated = SpotFormSchema.parse(data)
    const db = await getDb()
    const id = generateId()
    const now = new Date().toISOString()

    await db.execute(
      `INSERT INTO spots (id, name, type, capacity, price_per_night, has_electricity, has_water, has_sewer, size, is_active, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        validated.name,
        validated.type,
        validated.capacity,
        validated.pricePerNight,
        validated.hasElectricity ? 1 : 0,
        validated.hasWater ? 1 : 0,
        validated.hasSewer ? 1 : 0,
        validated.size,
        validated.isActive ? 1 : 0,
        validated.description ?? null,
        now,
        now,
      ]
    )

    return {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    }
  },

  async update(id: string, data: Partial<SpotFormData>): Promise<Spot> {
    const db = await getDb()
    const now = new Date().toISOString()

    const sets: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (data.name !== undefined) { sets.push(`name = $${paramIndex++}`); params.push(data.name) }
    if (data.type !== undefined) { sets.push(`type = $${paramIndex++}`); params.push(data.type) }
    if (data.capacity !== undefined) { sets.push(`capacity = $${paramIndex++}`); params.push(data.capacity) }
    if (data.pricePerNight !== undefined) { sets.push(`price_per_night = $${paramIndex++}`); params.push(data.pricePerNight) }
    if (data.hasElectricity !== undefined) { sets.push(`has_electricity = $${paramIndex++}`); params.push(data.hasElectricity ? 1 : 0) }
    if (data.hasWater !== undefined) { sets.push(`has_water = $${paramIndex++}`); params.push(data.hasWater ? 1 : 0) }
    if (data.hasSewer !== undefined) { sets.push(`has_sewer = $${paramIndex++}`); params.push(data.hasSewer ? 1 : 0) }
    if (data.size !== undefined) { sets.push(`size = $${paramIndex++}`); params.push(data.size) }
    if (data.isActive !== undefined) { sets.push(`is_active = $${paramIndex++}`); params.push(data.isActive ? 1 : 0) }
    if (data.description !== undefined) { sets.push(`description = $${paramIndex++}`); params.push(data.description ?? null) }

    sets.push(`updated_at = $${paramIndex++}`)
    params.push(now)
    params.push(id)

    await db.execute(
      `UPDATE spots SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
      params
    )

    const rows = await db.select<SpotRow[]>('SELECT * FROM spots WHERE id = $1', [id])
    if (rows.length === 0) throw new Error('Emplacement introuvable')
    return mapRow(rows[0])
  },

  async toggleActive(id: string): Promise<Spot> {
    const db = await getDb()
    const now = new Date().toISOString()

    await db.execute(
      'UPDATE spots SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = $1 WHERE id = $2',
      [now, id]
    )

    const rows = await db.select<SpotRow[]>('SELECT * FROM spots WHERE id = $1', [id])
    if (rows.length === 0) throw new Error('Emplacement introuvable')
    return mapRow(rows[0])
  },
}
