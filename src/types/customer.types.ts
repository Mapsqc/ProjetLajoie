import { z } from 'zod'

export const CustomerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  city: z.string().optional(),
  province: z.string().optional(),
  createdAt: z.string(),
})

export type Customer = z.infer<typeof CustomerSchema>
