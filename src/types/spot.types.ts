import { z } from 'zod'

// --- Enums ---

export const SpotServiceEnum = z.enum(['EEE', 'EEE50', 'EE', 'NAT', 'CHALET'])
export type SpotService = z.infer<typeof SpotServiceEnum>

export const SpotStatusEnum = z.enum(['REGULAR', 'SEASONAL', 'BACKUP', 'GROUP'])
export type SpotStatus = z.infer<typeof SpotStatusEnum>

export const VehicleTypeEnum = z.enum([
  'MOTORISE',
  'FIFTHWHEEL',
  'ROULOTTE',
  'CAMPEUR_PORTE',
  'TENTE_ROULOTTE',
  'TENTE',
])
export type VehicleType = z.infer<typeof VehicleTypeEnum>

export const GroundTypeEnum = z.enum([
  'GRAVEL',
  'SABLE',
  'GRAVEL_GAZON',
  'GRAVEL_SABLE',
  'ASPHALTE',
  'GAZON',
])
export type GroundType = z.infer<typeof GroundTypeEnum>

// --- Label maps ---

export const SERVICE_LABELS: Record<SpotService, string> = {
  EEE: '3 services (30A)',
  EEE50: '3 services (50A)',
  EE: '2 services',
  NAT: 'Nature',
  CHALET: 'Chalet',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  MOTORISE: 'Motorisé',
  FIFTHWHEEL: 'Fifth-wheel',
  ROULOTTE: 'Roulotte',
  CAMPEUR_PORTE: 'Campeur porté',
  TENTE_ROULOTTE: 'Tente-roulotte',
  TENTE: 'Tente',
}

export const GROUND_LABELS: Record<GroundType, string> = {
  GRAVEL: 'Gravier',
  SABLE: 'Sable',
  GRAVEL_GAZON: 'Gravier/Gazon',
  GRAVEL_SABLE: 'Gravier/Sable',
  ASPHALTE: 'Asphalte',
  GAZON: 'Gazon',
}

export const STATUS_LABELS: Record<SpotStatus, string> = {
  REGULAR: 'Régulier',
  SEASONAL: 'Saisonnier',
  BACKUP: 'Backup',
  GROUP: 'Groupe',
}

// --- Schemas ---

export const VehicleLengthRangeSchema = z
  .object({
    min: z.number().min(0),
    max: z.number().min(0),
  })
  .nullable()

export type VehicleLengthRange = z.infer<typeof VehicleLengthRangeSchema>

export const SpotSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  service: SpotServiceEnum,
  status: SpotStatusEnum,
  longueur: z.number().nullable(),
  largeur: z.number().nullable(),
  soleil: z.number().nullable(),
  motoriseRange: VehicleLengthRangeSchema,
  fifthwheelRange: VehicleLengthRangeSchema,
  roulotteRange: VehicleLengthRangeSchema,
  campeurPorte: z.boolean(),
  tenteRoulotte: z.boolean(),
  tente: z.boolean(),
  sol: GroundTypeEnum.nullable(),
  particularite: z.string().nullable(),
  pricePerNight: z.number().min(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Spot = z.infer<typeof SpotSchema>

export const SpotFormSchema = z.object({
  number: z.number().int().min(1, 'Le numéro est requis'),
  service: SpotServiceEnum,
  status: SpotStatusEnum,
  longueur: z.number().nullable(),
  largeur: z.number().nullable(),
  soleil: z.number().min(0).max(100).nullable(),
  motoriseRange: VehicleLengthRangeSchema,
  fifthwheelRange: VehicleLengthRangeSchema,
  roulotteRange: VehicleLengthRangeSchema,
  campeurPorte: z.boolean(),
  tenteRoulotte: z.boolean(),
  tente: z.boolean(),
  sol: GroundTypeEnum.nullable(),
  particularite: z.string().nullable(),
  pricePerNight: z.number().min(0, 'Le prix doit être positif'),
  isActive: z.boolean(),
})

export type SpotFormData = z.infer<typeof SpotFormSchema>
