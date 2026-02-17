<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Spot, SpotFormData } from '@/types'
import { SpotFormSchema } from '@/types'
import { useSpotsStore } from '@/stores/spots.store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  spot?: Spot
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const spotsStore = useSpotsStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<SpotFormData>({
  name: '',
  type: 'TENT',
  capacity: 4,
  pricePerNight: 30,
  hasElectricity: false,
  hasWater: false,
  hasSewer: false,
  size: 5,
  isActive: true,
  description: '',
})

watch(() => props.open, (open) => {
  if (open && props.spot) {
    form.value = {
      name: props.spot.name,
      type: props.spot.type,
      capacity: props.spot.capacity,
      pricePerNight: props.spot.pricePerNight,
      hasElectricity: props.spot.hasElectricity,
      hasWater: props.spot.hasWater,
      hasSewer: props.spot.hasSewer,
      size: props.spot.size,
      isActive: props.spot.isActive,
      description: props.spot.description || '',
    }
  } else if (open) {
    form.value = { name: '', type: 'TENT', capacity: 4, pricePerNight: 30, hasElectricity: false, hasWater: false, hasSewer: false, size: 5, isActive: true, description: '' }
  }
  errors.value = {}
})

async function handleSubmit() {
  const result = SpotFormSchema.safeParse(form.value)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((e) => {
      const path = e.path.join('.')
      fieldErrors[path] = e.message
    })
    errors.value = fieldErrors
    return
  }

  isSubmitting.value = true
  try {
    if (props.spot) {
      await spotsStore.updateSpot(props.spot.id, result.data)
      toast.success('Emplacement modifie')
    } else {
      await spotsStore.createSpot(result.data)
      toast.success('Emplacement cree')
    }
    emit('update:open', false)
  } catch (err) {
    console.error('Erreur sauvegarde emplacement:', err)
    const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ spot ? 'Modifier l\'emplacement' : 'Nouvel emplacement' }}</DialogTitle>
        <DialogDescription>
          {{ spot ? 'Modifiez les informations de l\'emplacement' : 'Remplissez les informations pour créer un nouvel emplacement' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="name">Nom</Label>
            <Input id="name" v-model="form.name" />
            <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
          </div>
          <div class="space-y-2">
            <Label for="type">Type</Label>
            <Select v-model="form.type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TENT">Tente</SelectItem>
                <SelectItem value="RV">VR</SelectItem>
                <SelectItem value="CABIN">Chalet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="capacity">Capacite</Label>
            <Input id="capacity" type="number" v-model.number="form.capacity" min="1" />
            <p v-if="errors.capacity" class="text-xs text-destructive">{{ errors.capacity }}</p>
          </div>
          <div class="space-y-2">
            <Label for="price">Prix / nuit ($)</Label>
            <Input id="price" type="number" v-model.number="form.pricePerNight" min="0" step="0.01" />
            <p v-if="errors.pricePerNight" class="text-xs text-destructive">{{ errors.pricePerNight }}</p>
          </div>
          <div class="space-y-2">
            <Label for="size">Taille (1-10)</Label>
            <Input id="size" type="number" v-model.number="form.size" min="1" max="10" />
            <p v-if="errors.size" class="text-xs text-destructive">{{ errors.size }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="form.description" />
        </div>

        <div class="flex gap-6">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.hasElectricity" class="rounded" />
            Electricite
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.hasWater" class="rounded" />
            Eau
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.hasSewer" class="rounded" />
            Egout
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.isActive" class="rounded" />
            Actif
          </label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'En cours...' : (spot ? 'Modifier' : 'Creer') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
