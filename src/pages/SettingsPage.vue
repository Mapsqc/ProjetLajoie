<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import type { AppSettings } from '@/services/settings.service'
import PageHeader from '@/components/shared/PageHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const settingsStore = useSettingsStore()

const form = ref<AppSettings>({
  campsiteName: '',
  contactEmail: '',
  contactPhone: '',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  seasonYear: String(new Date().getFullYear()),
})

watch(
  () => settingsStore.settings,
  (value) => {
    if (!value) return
    form.value = { ...value }
  },
  { immediate: true }
)

onMounted(async () => {
  await settingsStore.fetchSettings()
})

function validate(): boolean {
  if (!form.value.campsiteName.trim()) {
    toast.error('Le nom du camping est requis')
    return false
  }
  if (!form.value.contactEmail.trim()) {
    toast.error('Le courriel de contact est requis')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.contactEmail.trim())) {
    toast.error('Le format du courriel est invalide')
    return false
  }
  if (!form.value.seasonYear.trim()) {
    toast.error('L annee de saison est requise')
    return false
  }
  return true
}

async function handleSave() {
  if (!validate()) return
  try {
    await settingsStore.saveSettings({
      ...form.value,
      campsiteName: form.value.campsiteName.trim(),
      contactEmail: form.value.contactEmail.trim(),
      contactPhone: form.value.contactPhone.trim(),
      seasonYear: form.value.seasonYear.trim(),
    })
    toast.success('Parametres sauvegardes')
  } catch {
    toast.error(settingsStore.error || 'Erreur de sauvegarde')
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Parametres" description="Configuration generale de l'application" />

    <LoadingSpinner v-if="settingsStore.isLoading" />

    <template v-else>
      <Card>
        <CardHeader>
          <CardTitle>Informations generales</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2 sm:col-span-2">
            <Label for="campsiteName">Nom du camping</Label>
            <Input id="campsiteName" v-model="form.campsiteName" />
          </div>

          <div class="space-y-2">
            <Label for="contactEmail">Courriel de contact</Label>
            <Input id="contactEmail" type="email" v-model="form.contactEmail" />
          </div>

          <div class="space-y-2">
            <Label for="contactPhone">Telephone de contact</Label>
            <Input id="contactPhone" v-model="form.contactPhone" />
          </div>

          <div class="space-y-2">
            <Label for="checkInTime">Heure d'arrivee</Label>
            <Input id="checkInTime" type="time" v-model="form.checkInTime" />
          </div>

          <div class="space-y-2">
            <Label for="checkOutTime">Heure de depart</Label>
            <Input id="checkOutTime" type="time" v-model="form.checkOutTime" />
          </div>

          <div class="space-y-2">
            <Label for="seasonYear">Annee de saison</Label>
            <Input id="seasonYear" v-model="form.seasonYear" />
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-end">
        <Button type="button" :disabled="settingsStore.isSaving" @click="handleSave">
          {{ settingsStore.isSaving ? 'Enregistrement...' : 'Enregistrer les parametres' }}
        </Button>
      </div>
    </template>
  </div>
</template>
