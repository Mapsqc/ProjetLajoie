import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:camping-lajoie.db')
    // Vérifier que les tables existent (les migrations sont exécutées automatiquement par Tauri)
    try {
      await db.select('SELECT name FROM sqlite_master WHERE type="table" LIMIT 1')
    } catch (error) {
      console.error('Erreur lors de la vérification de la base de données:', error)
      throw new Error('La base de données n\'a pas pu être initialisée. Vérifiez que les migrations ont été exécutées.')
    }
  }
  return db
}
