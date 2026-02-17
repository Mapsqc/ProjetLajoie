import { z } from 'zod'

export const LoginRequestSchema = z.object({
  email: z.string().email('Courriel invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
})

export type AuthUser = z.infer<typeof AuthUserSchema>

export interface AuthResponse {
  user: AuthUser
  token: string
}
