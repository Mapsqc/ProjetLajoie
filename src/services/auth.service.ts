import { LoginRequestSchema, type AuthResponse, type LoginRequest } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const validated = LoginRequestSchema.parse(data)
    // With API-key auth, the Tauri app is already authenticated.
    // Return a local admin user for UI compatibility.
    return {
      user: {
        id: 'admin',
        email: validated.email,
        name: 'Administrateur',
        role: 'admin',
      },
      token: 'api-key-auth',
    }
  },
}
