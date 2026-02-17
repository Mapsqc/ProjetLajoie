import { z } from 'zod'

export const ReservationStatusEnum = z.enum(['CONFIRMED', 'HOLD', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'NO_SHOW'])
export type ReservationStatus = z.infer<typeof ReservationStatusEnum>

export const ReservationNoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
  author: z.string(),
})

export type ReservationNote = z.infer<typeof ReservationNoteSchema>

export const ReservationSchema = z.object({
  id: z.string(),
  spotId: z.string(),
  customerId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  status: ReservationStatusEnum,
  totalPrice: z.number(),
  adultsCount: z.number().int(),
  childrenCount: z.number().int(),
  notes: z.array(ReservationNoteSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Reservation = z.infer<typeof ReservationSchema>

export const ReservationFormSchema = z.object({
  spotId: z.string().min(1, 'L\'emplacement est requis'),
  customerId: z.string().min(1, 'Le client est requis'),
  checkIn: z.string().min(1, 'La date d\'arrivée est requise'),
  checkOut: z.string().min(1, 'La date de départ est requise'),
  adultsCount: z.number().int().min(1, 'Au moins 1 adulte requis'),
  childrenCount: z.number().int().min(0),
}).refine((data) => data.checkIn < data.checkOut, {
  message: 'La date de départ doit être après la date d\'arrivée',
  path: ['checkOut'],
})

export type ReservationFormData = z.infer<typeof ReservationFormSchema>
