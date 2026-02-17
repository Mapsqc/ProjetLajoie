import { LoginRequestSchema, type AuthResponse, type LoginRequest } from '@/types'
import { getDb } from './database'

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function isHashedPassword(password: string): boolean {
  return password.startsWith('sha256:')
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const validated = LoginRequestSchema.parse(data)
    const db = await getDb()

    const rows = await db.select<
      { id: string; email: string; name: string; role: string; password: string }[]
    >('SELECT id, email, name, role, password FROM users WHERE email = $1', [validated.email])

    if (rows.length === 0) {
      throw new Error('Courriel ou mot de passe invalide')
    }

    const user = rows[0]
    const storedPassword = user.password
    const plainPassword = validated.password
    const passwordValid = isHashedPassword(storedPassword)
      ? storedPassword === `sha256:${await sha256(plainPassword)}`
      : storedPassword === plainPassword

    if (!passwordValid) {
      throw new Error('Courriel ou mot de passe invalide')
    }

    // Security hardening: migrate legacy plaintext passwords to hashed format on successful login.
    if (!isHashedPassword(storedPassword)) {
      const hashed = `sha256:${await sha256(plainPassword)}`
      await db.execute('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id])
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: `local-token-${user.id}`,
    }
  },
}
