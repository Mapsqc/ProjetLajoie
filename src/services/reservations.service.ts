import type { Reservation, ReservationNote } from '@/types'
import { getDb } from './database'
import { parseFrenchDate } from '@/utils/date'
import { computeDeposit, computeTotalWithTax } from '@/utils/pricing'

export interface ReservationFilters {
  status?: string
  search?: string
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

interface ReservationRow {
  id: string
  spot_id: string
  customer_id: string
  check_in: string
  check_out: string
  status: string
  total_price: number
  adults_count: number
  children_count: number
  created_at: string
  updated_at: string
}

type StatusTransition = 'CANCELLED' | 'EXPIRED'

interface NoteRow {
  id: string
  reservation_id: string
  text: string
  author: string
  created_at: string
}

function mapNote(row: NoteRow): ReservationNote {
  return {
    id: row.id,
    text: row.text,
    author: row.author,
    createdAt: row.created_at,
  }
}

function mapRow(row: ReservationRow, notes: ReservationNote[] = []): Reservation {
  return {
    id: row.id,
    spotId: row.spot_id,
    customerId: row.customer_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status as Reservation['status'],
    totalPrice: row.total_price,
    adultsCount: row.adults_count,
    childrenCount: row.children_count,
    notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const reservationsService = {
  async getAll(filters?: ReservationFilters): Promise<Reservation[]> {
    const db = await getDb()
    let query = `
      SELECT r.* FROM reservations r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN spots s ON s.id = r.spot_id
    `
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    // Business rule: expired holds are not shown in admin dashboard.
    conditions.push(`r.status != $${paramIndex}`)
    params.push('EXPIRED')
    paramIndex++

    if (filters?.status) {
      conditions.push(`r.status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }
    if (filters?.search) {
      const like = `%${filters.search}%`
      const parsedDate = parseFrenchDate(filters.search)
      if (parsedDate) {
        conditions.push(
          `(c.first_name || ' ' || c.last_name LIKE $${paramIndex} OR s.name LIKE $${paramIndex + 1} OR c.email LIKE $${paramIndex + 2} OR c.phone LIKE $${paramIndex + 3} OR r.check_in = $${paramIndex + 4} OR r.check_out = $${paramIndex + 5})`
        )
        params.push(like, like, like, like, parsedDate, parsedDate)
      } else {
        conditions.push(
          `(c.first_name || ' ' || c.last_name LIKE $${paramIndex} OR s.name LIKE $${paramIndex + 1} OR c.email LIKE $${paramIndex + 2} OR c.phone LIKE $${paramIndex + 3} OR r.check_in LIKE $${paramIndex + 4} OR r.check_out LIKE $${paramIndex + 5})`
        )
        params.push(like, like, like, like, like, like)
      }
      paramIndex += 6
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY r.created_at DESC'

    const rows = await db.select<ReservationRow[]>(query, params)

    // Load notes for all reservations
    const reservations: Reservation[] = []
    for (const row of rows) {
      const noteRows = await db.select<NoteRow[]>(
        'SELECT * FROM reservation_notes WHERE reservation_id = $1 ORDER BY created_at ASC',
        [row.id]
      )
      reservations.push(mapRow(row, noteRows.map(mapNote)))
    }
    return reservations
  },

  async getById(id: string): Promise<Reservation> {
    const db = await getDb()
    const rows = await db.select<ReservationRow[]>(
      'SELECT * FROM reservations WHERE id = $1',
      [id]
    )
    if (rows.length === 0) throw new Error('Réservation introuvable')

    const noteRows = await db.select<NoteRow[]>(
      'SELECT * FROM reservation_notes WHERE reservation_id = $1 ORDER BY created_at ASC',
      [id]
    )

    return mapRow(rows[0], noteRows.map(mapNote))
  },

  async cancel(id: string): Promise<Reservation> {
    return this.updateStatus(id, 'CANCELLED')
  },

  async expire(id: string): Promise<Reservation> {
    return this.updateStatus(id, 'EXPIRED')
  },

  async updateStatus(id: string, status: StatusTransition): Promise<Reservation> {
    const db = await getDb()
    const now = new Date().toISOString()

    await db.execute(
      'UPDATE reservations SET status = $1, updated_at = $2 WHERE id = $3 AND status IN (\'HOLD\', \'CONFIRMED\')',
      [status, now, id]
    )

    return this.getById(id)
  },

  async updateDates(id: string, checkIn: string, checkOut: string): Promise<Reservation> {
    const db = await getDb()
    const now = new Date().toISOString()

    // Recalculate total price
    const rows = await db.select<ReservationRow[]>(
      'SELECT * FROM reservations WHERE id = $1',
      [id]
    )
    if (rows.length === 0) throw new Error('Réservation introuvable')

    const spotRows = await db.select<{ price_per_night: number }[]>(
      'SELECT price_per_night FROM spots WHERE id = $1',
      [rows[0].spot_id]
    )

    let totalPrice = rows[0].total_price
    if (spotRows.length > 0) {
      const nights = Math.max(
        1,
        Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      )
      const totalGuests = rows[0].adults_count + rows[0].children_count
      totalPrice = computeTotalWithTax(spotRows[0].price_per_night, nights, totalGuests)
    }
    const depositAmount = computeDeposit(totalPrice)

    try {
      await db.execute(
        'UPDATE reservations SET check_in = $1, check_out = $2, total_price = $3, deposit_amount = $4, updated_at = $5 WHERE id = $6',
        [checkIn, checkOut, totalPrice, depositAmount, now, id]
      )
    } catch {
      // Backward-compatible with DBs where website migrations have not yet added deposit_amount.
      await db.execute(
        'UPDATE reservations SET check_in = $1, check_out = $2, total_price = $3, updated_at = $4 WHERE id = $5',
        [checkIn, checkOut, totalPrice, now, id]
      )
    }

    return this.getById(id)
  },

  async addNote(id: string, text: string): Promise<Reservation> {
    const db = await getDb()
    const noteId = generateId('note')
    const now = new Date().toISOString()

    await db.execute(
      'INSERT INTO reservation_notes (id, reservation_id, text, author, created_at) VALUES ($1, $2, $3, $4, $5)',
      [noteId, id, text, 'Admin', now]
    )

    return this.getById(id)
  },

  async create(data: {
    spotId: string
    customerId: string
    checkIn: string
    checkOut: string
    adultsCount: number
    childrenCount: number
    totalPrice: number
  }): Promise<Reservation> {
    const db = await getDb()
    const id = generateId('res')
    const now = new Date().toISOString()
    const depositAmount = computeDeposit(data.totalPrice)

    try {
      await db.execute(
        `INSERT INTO reservations (id, spot_id, customer_id, check_in, check_out, status, total_price, adults_count, children_count, deposit_amount, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'HOLD', $6, $7, $8, $9, $10, $11)`,
        [id, data.spotId, data.customerId, data.checkIn, data.checkOut, data.totalPrice, data.adultsCount, data.childrenCount, depositAmount, now, now]
      )
    } catch {
      // Backward-compatible with DBs where website migrations have not yet added deposit_amount.
      await db.execute(
        `INSERT INTO reservations (id, spot_id, customer_id, check_in, check_out, status, total_price, adults_count, children_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'HOLD', $6, $7, $8, $9, $10)`,
        [id, data.spotId, data.customerId, data.checkIn, data.checkOut, data.totalPrice, data.adultsCount, data.childrenCount, now, now]
      )
    }

    return this.getById(id)
  },
}
