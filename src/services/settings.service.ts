import { apiGet, apiPut } from './api-client'

export interface AppSettings {
  campsiteName: string
  contactEmail: string
  contactPhone: string
  checkInTime: string
  checkOutTime: string
  seasonYear: string
}

export const settingsService = {
  async getGeneralSettings(): Promise<AppSettings> {
    return apiGet<AppSettings>('/api/admin/settings')
  },

  async saveGeneralSettings(settings: AppSettings): Promise<AppSettings> {
    return apiPut<AppSettings>('/api/admin/settings', settings)
  },
}
