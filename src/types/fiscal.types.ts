import { z } from 'zod'

export const FiscalSummarySchema = z.object({
  totalRevenue: z.number(),
  reservationCount: z.number(),
  month: z.number(),
  year: z.number(),
})

export type FiscalSummary = z.infer<typeof FiscalSummarySchema>
