import type { Customer } from '@/types'
import { getDb } from './database'

function generateId(): string {
  return `cu-${crypto.randomUUID().slice(0, 8)}`
}

interface CustomerRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string | null
  province: string | null
  created_at: string
}

function mapRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    city: row.city ?? undefined,
    province: row.province ?? undefined,
    createdAt: row.created_at,
  }
}

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const db = await getDb()
    const rows = await db.select<CustomerRow[]>(
      'SELECT * FROM customers ORDER BY created_at DESC'
    )
    return rows.map(mapRow)
  },

  async create(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }): Promise<Customer> {
    const db = await getDb()
    const id = generateId()
    const now = new Date().toISOString()

    try {
      await db.execute(
        'INSERT INTO customers (id, first_name, last_name, email, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, data.firstName, data.lastName, data.email, data.phone, now]
      )
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      // SQLite UNIQUE constraint error typically contains "UNIQUE constraint failed"
      if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('UNIQUE constraint failed')) {
        throw new Error('EMAIL_UNIQUE')
      }
      throw err
    }

    return {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      createdAt: now,
    }
  },
}
