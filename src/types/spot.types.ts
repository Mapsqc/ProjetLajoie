import { z } from 'zod'

export const SpotTypeEnum = z.enum(['TENT', 'RV', 'CABIN'])
export type SpotType = z.infer<typeof SpotTypeEnum>

export const SpotSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: SpotTypeEnum,
  capacity: z.number().int().min(1),
  pricePerNight: z.number().min(0),
  hasElectricity: z.boolean(),
  hasWater: z.boolean(),
  hasSewer: z.boolean(),
  size: z.number().int().min(1).max(10),
  isActive: z.boolean(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Spot = z.infer<typeof SpotSchema>

export const SpotFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: SpotTypeEnum,
  capacity: z.number().int().min(1, 'La capacité doit être au moins 1'),
  pricePerNight: z.number().min(0, 'Le prix doit être positif'),
  hasElectricity: z.boolean(),
  hasWater: z.boolean(),
  hasSewer: z.boolean(),
  size: z.number().int().min(1, 'La taille doit être entre 1 et 10').max(10, 'La taille doit être entre 1 et 10'),
  isActive: z.boolean(),
  description: z.string().optional(),
})

export type SpotFormData = z.infer<typeof SpotFormSchema>
