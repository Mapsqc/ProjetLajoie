import type Database from 'better-sqlite3'
import { seedSpots } from './seed-spots'

export function runMigrations(db: Database.Database) {
  // --- Migration 1: Base tables ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS spots (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      service TEXT NOT NULL DEFAULT 'EEE',
      status TEXT NOT NULL DEFAULT 'REGULAR',
      price_per_night REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      longueur REAL,
      largeur REAL,
      soleil INTEGER,
      motorise_range_min REAL,
      motorise_range_max REAL,
      fifthwheel_range_min REAL,
      fifthwheel_range_max REAL,
      roulotte_range_min REAL,
      roulotte_range_max REAL,
      campeur_porte INTEGER NOT NULL DEFAULT 0,
      tente_roulotte INTEGER NOT NULL DEFAULT 0,
      tente INTEGER NOT NULL DEFAULT 0,
      sol TEXT,
      particularite TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      province TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'CA',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      spot_id TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      adults_count INTEGER NOT NULL DEFAULT 2,
      children_count INTEGER NOT NULL DEFAULT 0,
      total_price REAL NOT NULL DEFAULT 0,
      deposit_amount REAL,
      stripe_session_id TEXT,
      reservation_access_token TEXT,
      hold_expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (spot_id) REFERENCES spots(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      reservation_id TEXT NOT NULL,
      text TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    );
  `)

  // --- Migration 2: Add columns if missing (safe idempotent migration) ---
  const spotColumns = db.pragma('table_info(spots)') as { name: string }[]
  const colNames = spotColumns.map((c) => c.name)

  const addIfMissing = (col: string, def: string) => {
    if (!colNames.includes(col)) {
      db.exec(`ALTER TABLE spots ADD COLUMN ${col} ${def}`)
    }
  }

  // New model columns (in case table was created with old schema)
  addIfMissing('service', "TEXT NOT NULL DEFAULT 'EEE'")
  addIfMissing('status', "TEXT NOT NULL DEFAULT 'REGULAR'")
  addIfMissing('longueur', 'REAL')
  addIfMissing('largeur', 'REAL')
  addIfMissing('soleil', 'INTEGER')
  addIfMissing('motorise_range_min', 'REAL')
  addIfMissing('motorise_range_max', 'REAL')
  addIfMissing('fifthwheel_range_min', 'REAL')
  addIfMissing('fifthwheel_range_max', 'REAL')
  addIfMissing('roulotte_range_min', 'REAL')
  addIfMissing('roulotte_range_max', 'REAL')
  addIfMissing('campeur_porte', 'INTEGER NOT NULL DEFAULT 0')
  addIfMissing('tente_roulotte', 'INTEGER NOT NULL DEFAULT 0')
  addIfMissing('tente', 'INTEGER NOT NULL DEFAULT 0')
  addIfMissing('sol', 'TEXT')
  addIfMissing('particularite', 'TEXT')

  // Reservation columns
  const resColumns = db.pragma('table_info(reservations)') as { name: string }[]
  const resCols = resColumns.map((c) => c.name)

  const addResIfMissing = (col: string, def: string) => {
    if (!resCols.includes(col)) {
      db.exec(`ALTER TABLE reservations ADD COLUMN ${col} ${def}`)
    }
  }

  addResIfMissing('hold_expires_at', 'TEXT')
  addResIfMissing('deposit_amount', 'REAL')
  addResIfMissing('stripe_session_id', 'TEXT')
  addResIfMissing('reservation_access_token', 'TEXT')

  // --- Seed spots with new data ---
  // Check if we need to re-seed (if old model or empty)
  const spotCount = db.prepare('SELECT COUNT(*) as count FROM spots').get() as { count: number }
  const hasServiceCol = colNames.includes('service') || true // We just added it
  const firstSpot = db.prepare('SELECT * FROM spots LIMIT 1').get() as any

  // Re-seed if: no spots, or old model (has 'type' column with TENT/RV values)
  const needsReseed = spotCount.count === 0 ||
    (firstSpot && (firstSpot.type === 'TENT' || firstSpot.type === 'RV')) ||
    (firstSpot && !firstSpot.service)

  if (needsReseed) {
    console.log('[migrate] Re-seeding spots with new model...')
    seedSpots(db)
  }

  console.log('[migrate] Migrations complete')
}
