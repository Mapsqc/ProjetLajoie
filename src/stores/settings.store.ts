import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService, type AppSettings } from '@/services/settings.service'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  async function fetchSettings() {
    isLoading.value = true
    error.value = null
    try {
      settings.value = await settingsService.getGeneralSettings()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de chargement des paramètres'
    } finally {
      isLoading.value = false
    }
  }

  async function saveSettings(data: AppSettings) {
    isSaving.value = true
    error.value = null
    try {
      settings.value = await settingsService.saveGeneralSettings(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur de sauvegarde des paramètres'
      throw e
    } finally {
      isSaving.value = false
    }
  }

  return {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    saveSettings,
  }
})
