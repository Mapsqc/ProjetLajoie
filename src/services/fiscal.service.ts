import type { FiscalSummary } from '@/types'
import { apiGet } from './api-client'

export const fiscalService = {
  async getMonthlySummary(year: number, month: number): Promise<FiscalSummary> {
    return apiGet<FiscalSummary>('/api/admin/fiscal/monthly', { year, month })
  },
}
