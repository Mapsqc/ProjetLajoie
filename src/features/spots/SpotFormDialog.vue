<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Spot, SpotFormData } from '@/types'
import { SpotFormSchema, SERVICE_LABELS, STATUS_LABELS, GROUND_LABELS, VEHICLE_TYPE_LABELS } from '@/types'
import type { SpotService, SpotStatus, GroundType } from '@/types'
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

// Toggles for ranged vehicle types
const acceptsMotorised = ref(false)
const acceptsFifthwheel = ref(false)
const acceptsRoulotte = ref(false)

function getDefaultForm(): SpotFormData {
  return {
    number: 1,
    service: 'EEE',
    status: 'REGULAR',
    longueur: null,
    largeur: null,
    soleil: null,
    motoriseRange: null,
    fifthwheelRange: null,
    roulotteRange: null,
    campeurPorte: false,
    tenteRoulotte: false,
    tente: false,
    sol: null,
    particularite: null,
    pricePerNight: 30,
    isActive: true,
  }
}

const form = ref<SpotFormData>(getDefaultForm())

// Temp fields for ranged vehicles min/max
const motoriseMin = ref(0)
const motoriseMax = ref(0)
const fifthwheelMin = ref(0)
const fifthwheelMax = ref(0)
const roulotteMin = ref(0)
const roulotteMax = ref(0)

watch(() => props.open, (open) => {
  if (open && props.spot) {
    form.value = {
      number: props.spot.number,
      service: props.spot.service,
      status: props.spot.status,
      longueur: props.spot.longueur,
      largeur: props.spot.largeur,
      soleil: props.spot.soleil,
      motoriseRange: props.spot.motoriseRange,
      fifthwheelRange: props.spot.fifthwheelRange,
      roulotteRange: props.spot.roulotteRange,
      campeurPorte: props.spot.campeurPorte,
      tenteRoulotte: props.spot.tenteRoulotte,
      tente: props.spot.tente,
      sol: props.spot.sol,
      particularite: props.spot.particularite,
      pricePerNight: props.spot.pricePerNight,
      isActive: props.spot.isActive,
    }
    acceptsMotorised.value = props.spot.motoriseRange !== null
    acceptsFifthwheel.value = props.spot.fifthwheelRange !== null
    acceptsRoulotte.value = props.spot.roulotteRange !== null
    motoriseMin.value = props.spot.motoriseRange?.min ?? 0
    motoriseMax.value = props.spot.motoriseRange?.max ?? 0
    fifthwheelMin.value = props.spot.fifthwheelRange?.min ?? 0
    fifthwheelMax.value = props.spot.fifthwheelRange?.max ?? 0
    roulotteMin.value = props.spot.roulotteRange?.min ?? 0
    roulotteMax.value = props.spot.roulotteRange?.max ?? 0
  } else if (open) {
    form.value = getDefaultForm()
    acceptsMotorised.value = false
    acceptsFifthwheel.value = false
    acceptsRoulotte.value = false
    motoriseMin.value = 0
    motoriseMax.value = 0
    fifthwheelMin.value = 0
    fifthwheelMax.value = 0
    roulotteMin.value = 0
    roulotteMax.value = 0
  }
  errors.value = {}
})

function buildFormData(): SpotFormData {
  return {
    ...form.value,
    motoriseRange: acceptsMotorised.value ? { min: motoriseMin.value, max: motoriseMax.value } : null,
    fifthwheelRange: acceptsFifthwheel.value ? { min: fifthwheelMin.value, max: fifthwheelMax.value } : null,
    roulotteRange: acceptsRoulotte.value ? { min: roulotteMin.value, max: roulotteMax.value } : null,
  }
}

async function handleSubmit() {
  const data = buildFormData()
  const result = SpotFormSchema.safeParse(data)
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
      toast.success('Emplacement modifié')
    } else {
      await spotsStore.createSpot(result.data)
      toast.success('Emplacement créé')
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

const serviceOptions = Object.entries(SERVICE_LABELS) as [SpotService, string][]
const statusOptions = Object.entries(STATUS_LABELS) as [SpotStatus, string][]
const groundOptions = Object.entries(GROUND_LABELS) as [GroundType, string][]
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ spot ? 'Modifier l\'emplacement' : 'Nouvel emplacement' }}</DialogTitle>
        <DialogDescription>
          {{ spot ? 'Modifiez les informations de l\'emplacement' : 'Remplissez les informations pour créer un nouvel emplacement' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Section 1: Infos de base -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-muted-foreground">Informations de base</h3>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-2">
              <Label for="number">Numéro</Label>
              <Input id="number" type="number" v-model.number="form.number" min="1" />
              <p v-if="errors.number" class="text-xs text-destructive">{{ errors.number }}</p>
            </div>
            <div class="space-y-2">
              <Label for="service">Service</Label>
              <Select v-model="form.service">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="[val, label] in serviceOptions" :key="val" :value="val">
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="status">Catégorie</Label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="[val, label] in statusOptions" :key="val" :value="val">
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="price">Prix / nuit ($)</Label>
              <Input id="price" type="number" v-model.number="form.pricePerNight" min="0" step="0.01" />
              <p v-if="errors.pricePerNight" class="text-xs text-destructive">{{ errors.pricePerNight }}</p>
            </div>
            <div class="flex items-end pb-2">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="form.isActive" class="rounded" />
                Actif
              </label>
            </div>
          </div>
        </div>

        <!-- Section 2: Dimensions -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-muted-foreground">Dimensions</h3>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-2">
              <Label for="longueur">Longueur (pi)</Label>
              <Input id="longueur" type="number" :model-value="form.longueur ?? ''" @update:model-value="form.longueur = $event === '' ? null : Number($event)" min="0" />
            </div>
            <div class="space-y-2">
              <Label for="largeur">Largeur (pi)</Label>
              <Input id="largeur" type="number" :model-value="form.largeur ?? ''" @update:model-value="form.largeur = $event === '' ? null : Number($event)" min="0" />
            </div>
            <div class="space-y-2">
              <Label for="soleil">Soleil (%)</Label>
              <Input id="soleil" type="number" :model-value="form.soleil ?? ''" @update:model-value="form.soleil = $event === '' ? null : Number($event)" min="0" max="100" />
              <p v-if="errors.soleil" class="text-xs text-destructive">{{ errors.soleil }}</p>
            </div>
          </div>
        </div>

        <!-- Section 3: Véhicules -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-muted-foreground">Véhicules acceptés</h3>

          <!-- Motorisé -->
          <div class="rounded-md border p-3 space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" v-model="acceptsMotorised" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.MOTORISE }}
            </label>
            <div v-if="acceptsMotorised" class="grid gap-3 sm:grid-cols-2 ml-6">
              <div class="space-y-1">
                <Label class="text-xs">Min (pi)</Label>
                <Input type="number" v-model.number="motoriseMin" min="0" class="h-8" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Max (pi)</Label>
                <Input type="number" v-model.number="motoriseMax" min="0" class="h-8" />
              </div>
            </div>
          </div>

          <!-- Fifth-wheel -->
          <div class="rounded-md border p-3 space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" v-model="acceptsFifthwheel" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.FIFTHWHEEL }}
            </label>
            <div v-if="acceptsFifthwheel" class="grid gap-3 sm:grid-cols-2 ml-6">
              <div class="space-y-1">
                <Label class="text-xs">Min (pi)</Label>
                <Input type="number" v-model.number="fifthwheelMin" min="0" class="h-8" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Max (pi)</Label>
                <Input type="number" v-model.number="fifthwheelMax" min="0" class="h-8" />
              </div>
            </div>
          </div>

          <!-- Roulotte -->
          <div class="rounded-md border p-3 space-y-2">
            <label class="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" v-model="acceptsRoulotte" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.ROULOTTE }}
            </label>
            <div v-if="acceptsRoulotte" class="grid gap-3 sm:grid-cols-2 ml-6">
              <div class="space-y-1">
                <Label class="text-xs">Min (pi)</Label>
                <Input type="number" v-model.number="roulotteMin" min="0" class="h-8" />
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Max (pi)</Label>
                <Input type="number" v-model.number="roulotteMax" min="0" class="h-8" />
              </div>
            </div>
          </div>

          <!-- Boolean vehicle types -->
          <div class="flex flex-wrap gap-4 pt-1">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.campeurPorte" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.CAMPEUR_PORTE }}
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.tenteRoulotte" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.TENTE_ROULOTTE }}
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.tente" class="rounded" />
              {{ VEHICLE_TYPE_LABELS.TENTE }}
            </label>
          </div>
        </div>

        <!-- Section 4: Terrain -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-muted-foreground">Terrain</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="sol">Type de sol</Label>
              <Select :model-value="form.sol ?? 'NONE'" @update:model-value="form.sol = $event === 'NONE' ? null : ($event as GroundType)">
                <SelectTrigger>
                  <SelectValue placeholder="Non spécifié" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Non spécifié</SelectItem>
                  <SelectItem v-for="[val, label] in groundOptions" :key="val" :value="val">
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="particularite">Particularité</Label>
            <textarea
              id="particularite"
              :value="form.particularite ?? ''"
              @input="form.particularite = ($event.target as HTMLTextAreaElement).value || null"
              class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows="2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'En cours...' : (spot ? 'Modifier' : 'Créer') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
