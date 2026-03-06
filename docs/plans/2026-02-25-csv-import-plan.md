# Import CSV avec mapping interactif — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre l'import de clients, emplacements et réservations depuis des fichiers CSV avec mapping interactif des colonnes dans le panel admin.

**Architecture:** Page `/import` avec stepper 4 étapes (choix type → upload CSV → mapping colonnes → aperçu/import). Parsing côté client avec PapaParse, validation Zod, import batch via les endpoints API existants.

**Tech Stack:** Vue 3 + TypeScript, PapaParse, Zod, shadcn-vue, API REST existante

---

### Task 1: Installer PapaParse

**Files:**
- Modify: `package.json`

**Step 1: Installer la dépendance**

Run: `npm install papaparse && npm install -D @types/papaparse`

**Step 2: Vérifier l'installation**

Run: `npm ls papaparse`
Expected: `papaparse@5.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add papaparse dependency for CSV import"
```

---

### Task 2: Créer les schémas d'import et la logique de mapping

**Files:**
- Create: `src/features/import/import-schemas.ts`
- Test: `src/features/import/import-schemas.test.ts`

**Step 1: Écrire les tests**

```typescript
// src/features/import/import-schemas.test.ts
import { describe, it, expect } from 'vitest'
import { autoMapColumns, IMPORT_CONFIGS, validateRow } from './import-schemas'

describe('IMPORT_CONFIGS', () => {
  it('defines configs for customers, spots, and reservations', () => {
    expect(IMPORT_CONFIGS.customers).toBeDefined()
    expect(IMPORT_CONFIGS.spots).toBeDefined()
    expect(IMPORT_CONFIGS.reservations).toBeDefined()
  })

  it('each config has required and optional fields', () => {
    const config = IMPORT_CONFIGS.customers
    expect(config.fields.filter(f => f.required).length).toBeGreaterThan(0)
    expect(config.fields.length).toBeGreaterThan(config.fields.filter(f => f.required).length)
  })
})

describe('autoMapColumns', () => {
  it('maps exact french column names to fields', () => {
    const csvHeaders = ['prenom', 'nom', 'courriel', 'telephone']
    const result = autoMapColumns(csvHeaders, 'customers')
    expect(result['prenom']).toBe('firstName')
    expect(result['nom']).toBe('lastName')
    expect(result['courriel']).toBe('email')
    expect(result['telephone']).toBe('phone')
  })

  it('maps english column names', () => {
    const csvHeaders = ['first_name', 'last_name', 'email', 'phone']
    const result = autoMapColumns(csvHeaders, 'customers')
    expect(result['first_name']).toBe('firstName')
    expect(result['last_name']).toBe('lastName')
    expect(result['email']).toBe('email')
    expect(result['phone']).toBe('phone')
  })

  it('returns empty string for unrecognized columns', () => {
    const csvHeaders = ['xyz_unknown']
    const result = autoMapColumns(csvHeaders, 'customers')
    expect(result['xyz_unknown']).toBe('')
  })
})

describe('validateRow', () => {
  it('returns success for valid customer row', () => {
    const row = { firstName: 'Jean', lastName: 'Tremblay', email: 'jean@test.com', phone: '514-555-1234' }
    const result = validateRow(row, 'customers')
    expect(result.valid).toBe(true)
  })

  it('returns error for customer row missing email', () => {
    const row = { firstName: 'Jean', lastName: 'Tremblay', email: '', phone: '514-555-1234' }
    const result = validateRow(row, 'customers')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('validates spot row with required fields', () => {
    const row = { number: 42, service: 'EEE', status: 'REGULAR', pricePerNight: 52 }
    const result = validateRow(row, 'spots')
    expect(result.valid).toBe(true)
  })

  it('rejects spot with invalid service', () => {
    const row = { number: 42, service: 'INVALID', status: 'REGULAR', pricePerNight: 52 }
    const result = validateRow(row, 'spots')
    expect(result.valid).toBe(false)
  })
})
```

**Step 2: Vérifier que les tests échouent**

Run: `npx vitest run src/features/import/import-schemas.test.ts`
Expected: FAIL — module not found

**Step 3: Implémenter import-schemas.ts**

```typescript
// src/features/import/import-schemas.ts
import { z } from 'zod'
import { SpotServiceEnum, SpotStatusEnum, GroundTypeEnum } from '@/types'

export type ImportType = 'customers' | 'spots' | 'reservations'

export interface FieldConfig {
  key: string            // Nom du champ système (ex: 'firstName')
  label: string          // Label affiché en français
  required: boolean
  aliases: string[]      // Noms CSV possibles pour l'auto-mapping
  transform?: (value: string) => unknown  // Transformation de la valeur string CSV
}

export interface ImportConfig {
  label: string
  fields: FieldConfig[]
  schema: z.ZodType       // Schéma Zod pour validation
}

// --- Schemas de validation pour l'import ---

const CustomerImportSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Le courriel est invalide'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  city: z.string().optional().default(''),
  province: z.string().optional().default(''),
})

const SpotImportSchema = z.object({
  number: z.coerce.number().int().min(1, 'Le numéro est requis'),
  service: SpotServiceEnum,
  status: SpotStatusEnum,
  pricePerNight: z.coerce.number().min(0, 'Le prix doit être positif'),
  sol: GroundTypeEnum.nullable().optional().default(null),
  longueur: z.coerce.number().nullable().optional().default(null),
  largeur: z.coerce.number().nullable().optional().default(null),
  isActive: z.preprocess((v) => v === 'true' || v === '1' || v === true, z.boolean()).optional().default(true),
})

const ReservationImportSchema = z.object({
  spotNumber: z.coerce.number().int().min(1, 'Le numéro d\'emplacement est requis'),
  customerEmail: z.string().email('Le courriel client est requis'),
  checkIn: z.string().min(1, 'La date d\'arrivée est requise'),
  checkOut: z.string().min(1, 'La date de départ est requise'),
  adultsCount: z.coerce.number().int().min(1).default(1),
  childrenCount: z.coerce.number().int().min(0).default(0),
  status: z.string().optional().default('CONFIRMED'),
  totalPrice: z.coerce.number().optional(),
})

// --- Configs par type ---

const toNumber = (v: string) => v === '' ? null : Number(v)

export const IMPORT_CONFIGS: Record<ImportType, ImportConfig> = {
  customers: {
    label: 'Clients',
    fields: [
      { key: 'firstName', label: 'Prénom', required: true, aliases: ['prenom', 'prénom', 'first_name', 'firstname', 'first name'] },
      { key: 'lastName', label: 'Nom', required: true, aliases: ['nom', 'last_name', 'lastname', 'last name', 'nom_famille'] },
      { key: 'email', label: 'Courriel', required: true, aliases: ['courriel', 'email', 'e-mail', 'mail'] },
      { key: 'phone', label: 'Téléphone', required: true, aliases: ['telephone', 'téléphone', 'phone', 'tel', 'tél', 'cell', 'cellulaire'] },
      { key: 'city', label: 'Ville', required: false, aliases: ['ville', 'city', 'municipalite', 'municipalité'] },
      { key: 'province', label: 'Province', required: false, aliases: ['province', 'prov', 'state', 'état', 'etat'] },
    ],
    schema: CustomerImportSchema,
  },
  spots: {
    label: 'Emplacements',
    fields: [
      { key: 'number', label: 'Numéro', required: true, aliases: ['numero', 'numéro', 'number', 'no', 'num', '#', 'spot'] },
      { key: 'service', label: 'Service', required: true, aliases: ['service', 'type_service', 'services'] },
      { key: 'status', label: 'Statut', required: true, aliases: ['statut', 'status', 'type'] },
      { key: 'pricePerNight', label: 'Prix/nuit', required: true, aliases: ['prix', 'price', 'prix_nuit', 'price_per_night', 'tarif', 'cout', 'coût'], transform: toNumber },
      { key: 'sol', label: 'Type de sol', required: false, aliases: ['sol', 'ground', 'terrain', 'ground_type'] },
      { key: 'longueur', label: 'Longueur', required: false, aliases: ['longueur', 'length', 'long'], transform: toNumber },
      { key: 'largeur', label: 'Largeur', required: false, aliases: ['largeur', 'width', 'larg'], transform: toNumber },
    ],
    schema: SpotImportSchema,
  },
  reservations: {
    label: 'Réservations',
    fields: [
      { key: 'spotNumber', label: 'No emplacement', required: true, aliases: ['emplacement', 'spot', 'numero_emplacement', 'spot_number', 'terrain', 'no_emplacement'] },
      { key: 'customerEmail', label: 'Courriel client', required: true, aliases: ['courriel', 'email', 'courriel_client', 'customer_email', 'client_email', 'e-mail'] },
      { key: 'checkIn', label: "Date d'arrivée", required: true, aliases: ['arrivee', 'arrivée', 'check_in', 'checkin', 'date_arrivee', 'debut', 'début', 'start'] },
      { key: 'checkOut', label: 'Date de départ', required: true, aliases: ['depart', 'départ', 'check_out', 'checkout', 'date_depart', 'fin', 'end'] },
      { key: 'adultsCount', label: 'Adultes', required: true, aliases: ['adultes', 'adults', 'nb_adultes', 'adulte'] },
      { key: 'childrenCount', label: 'Enfants', required: false, aliases: ['enfants', 'children', 'nb_enfants', 'enfant'] },
      { key: 'status', label: 'Statut', required: false, aliases: ['statut', 'status'] },
      { key: 'totalPrice', label: 'Prix total', required: false, aliases: ['prix', 'total', 'prix_total', 'price', 'montant'] },
    ],
    schema: ReservationImportSchema,
  },
}

/**
 * Auto-mapping : compare les en-têtes CSV (normalisés) aux aliases des champs.
 * Retourne un mapping { csvHeader: systemFieldKey | '' }
 */
export function autoMapColumns(csvHeaders: string[], type: ImportType): Record<string, string> {
  const config = IMPORT_CONFIGS[type]
  const mapping: Record<string, string> = {}

  for (const header of csvHeaders) {
    const normalized = header.toLowerCase().trim().replace(/[\s-]+/g, '_')
    let matched = ''

    for (const field of config.fields) {
      if (field.aliases.some((a) => a.toLowerCase().replace(/[\s-]+/g, '_') === normalized)) {
        matched = field.key
        break
      }
      // Fallback: le header contient le key système
      if (normalized === field.key.toLowerCase()) {
        matched = field.key
        break
      }
    }

    mapping[header] = matched
  }

  return mapping
}

/**
 * Applique le mapping sur une ligne CSV brute et retourne un objet avec les champs système.
 */
export function applyMapping(
  csvRow: Record<string, string>,
  mapping: Record<string, string>,
  type: ImportType
): Record<string, unknown> {
  const config = IMPORT_CONFIGS[type]
  const result: Record<string, unknown> = {}

  for (const [csvHeader, fieldKey] of Object.entries(mapping)) {
    if (!fieldKey) continue
    const rawValue = csvRow[csvHeader] ?? ''
    const fieldConfig = config.fields.find((f) => f.key === fieldKey)
    result[fieldKey] = fieldConfig?.transform ? fieldConfig.transform(rawValue) : rawValue
  }

  return result
}

/**
 * Valide une ligne mappée avec le schéma Zod du type.
 */
export function validateRow(
  row: Record<string, unknown>,
  type: ImportType
): { valid: boolean; errors: string[]; data?: Record<string, unknown> } {
  const config = IMPORT_CONFIGS[type]
  const result = config.schema.safeParse(row)

  if (result.success) {
    return { valid: true, errors: [], data: result.data as Record<string, unknown> }
  }

  return {
    valid: false,
    errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  }
}
```

**Step 4: Lancer les tests**

Run: `npx vitest run src/features/import/import-schemas.test.ts`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add src/features/import/import-schemas.ts src/features/import/import-schemas.test.ts
git commit -m "feat: add import schemas, auto-mapping and validation logic"
```

---

### Task 3: Créer le service d'import batch

**Files:**
- Create: `src/services/import.service.ts`

**Step 1: Implémenter le service**

```typescript
// src/services/import.service.ts
import type { Customer, Spot } from '@/types'
import { customersService } from './customers.service'
import { spotsService } from './spots.service'
import { reservationsService } from './reservations.service'
import { computeTotalWithTax } from '@/utils/pricing'

export interface ImportProgress {
  total: number
  done: number
  errors: { row: number; message: string }[]
}

const BATCH_SIZE = 50

/**
 * Import batch de clients. Retourne la progression à chaque étape via le callback.
 */
export async function importCustomers(
  rows: Record<string, unknown>[],
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> {
  const progress: ImportProgress = { total: rows.length, done: 0, errors: [] }

  for (let i = 0; i < rows.length; i++) {
    try {
      await customersService.create(rows[i] as { firstName: string; lastName: string; email: string; phone: string })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      progress.errors.push({ row: i + 1, message: msg })
    }
    progress.done = i + 1
    if (progress.done % BATCH_SIZE === 0 || progress.done === progress.total) {
      onProgress({ ...progress, errors: [...progress.errors] })
    }
  }

  return progress
}

/**
 * Import batch d'emplacements.
 */
export async function importSpots(
  rows: Record<string, unknown>[],
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> {
  const progress: ImportProgress = { total: rows.length, done: 0, errors: [] }

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i] as Record<string, unknown>
      await spotsService.create({
        number: row.number as number,
        service: row.service as 'EEE',
        status: row.status as 'REGULAR',
        pricePerNight: row.pricePerNight as number,
        sol: (row.sol as string) || null,
        longueur: row.longueur as number | null ?? null,
        largeur: row.largeur as number | null ?? null,
        soleil: null,
        motoriseRange: null,
        fifthwheelRange: null,
        roulotteRange: null,
        campeurPorte: false,
        tenteRoulotte: false,
        tente: false,
        particularite: null,
        isActive: row.isActive !== false,
      } as any)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      progress.errors.push({ row: i + 1, message: msg })
    }
    progress.done = i + 1
    if (progress.done % BATCH_SIZE === 0 || progress.done === progress.total) {
      onProgress({ ...progress, errors: [...progress.errors] })
    }
  }

  return progress
}

/**
 * Import batch de réservations. Résout spotNumber → spotId et customerEmail → customerId.
 */
export async function importReservations(
  rows: Record<string, unknown>[],
  spots: Spot[],
  customers: Customer[],
  onProgress: (progress: ImportProgress) => void
): Promise<ImportProgress> {
  const progress: ImportProgress = { total: rows.length, done: 0, errors: [] }

  // Index pour résolution rapide
  const spotByNumber = new Map(spots.map((s) => [s.number, s]))
  const customerByEmail = new Map(customers.map((c) => [c.email.toLowerCase(), c]))

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i] as Record<string, unknown>
      const spotNumber = Number(row.spotNumber)
      const customerEmail = String(row.customerEmail).toLowerCase()

      const spot = spotByNumber.get(spotNumber)
      if (!spot) throw new Error(`Emplacement #${spotNumber} introuvable`)

      const customer = customerByEmail.get(customerEmail)
      if (!customer) throw new Error(`Client ${customerEmail} introuvable`)

      const checkIn = String(row.checkIn)
      const checkOut = String(row.checkOut)
      const adultsCount = Number(row.adultsCount) || 1
      const childrenCount = Number(row.childrenCount) || 0

      const dayjs = (await import('@/utils/date')).dayjs
      const nights = dayjs(checkOut).diff(dayjs(checkIn), 'day')
      const totalPrice = row.totalPrice ? Number(row.totalPrice) : computeTotalWithTax(spot.pricePerNight, nights, adultsCount)

      await reservationsService.create({
        spotId: spot.id,
        customerId: customer.id,
        checkIn,
        checkOut,
        adultsCount,
        childrenCount,
        totalPrice,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      progress.errors.push({ row: i + 1, message: msg })
    }
    progress.done = i + 1
    if (progress.done % BATCH_SIZE === 0 || progress.done === progress.total) {
      onProgress({ ...progress, errors: [...progress.errors] })
    }
  }

  return progress
}
```

**Step 2: Commit**

```bash
git add src/services/import.service.ts
git commit -m "feat: add batch import service for customers, spots, reservations"
```

---

### Task 4: Créer le composant ImportTypePicker (étape 1)

**Files:**
- Create: `src/features/import/ImportTypePicker.vue`

**Step 1: Implémenter le composant**

```vue
<!-- src/features/import/ImportTypePicker.vue -->
<script setup lang="ts">
import type { ImportType } from './import-schemas'
import { IMPORT_CONFIGS } from './import-schemas'
import { Users, MapPin, BookOpen, AlertTriangle } from 'lucide-vue-next'

defineProps<{ modelValue: ImportType | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: ImportType): void }>()

const options: { type: ImportType; icon: typeof Users; description: string }[] = [
  { type: 'spots', icon: MapPin, description: 'Importer les emplacements du camping' },
  { type: 'customers', icon: Users, description: 'Importer la liste des clients' },
  { type: 'reservations', icon: BookOpen, description: 'Importer les réservations existantes' },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
      <p>Ordre recommandé : <strong>Emplacements</strong> → <strong>Clients</strong> → <strong>Réservations</strong> (les réservations référencent les emplacements et clients existants).</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="opt in options"
        :key="opt.type"
        class="flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-colors hover:bg-muted/50"
        :class="modelValue === opt.type ? 'border-primary bg-primary/5' : 'border-border'"
        @click="emit('update:modelValue', opt.type)"
      >
        <component :is="opt.icon" class="h-8 w-8 text-primary" />
        <div>
          <p class="font-semibold">{{ IMPORT_CONFIGS[opt.type].label }}</p>
          <p class="text-xs text-muted-foreground">{{ opt.description }}</p>
        </div>
      </button>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add src/features/import/ImportTypePicker.vue
git commit -m "feat: add ImportTypePicker component (step 1 of import wizard)"
```

---

### Task 5: Créer le composant CsvUploader (étape 2)

**Files:**
- Create: `src/features/import/CsvUploader.vue`

**Step 1: Implémenter le composant**

```vue
<!-- src/features/import/CsvUploader.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  (e: 'parsed', payload: { headers: string[]; rows: Record<string, string>[] }): void
}>()

const isDragging = ref(false)
const fileName = ref('')
const parseError = ref('')

function handleFile(file: File) {
  if (!file.name.endsWith('.csv')) {
    parseError.value = 'Le fichier doit être un CSV (.csv)'
    return
  }

  parseError.value = ''
  fileName.value = file.name

  Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
    encoding: 'UTF-8',
    complete(results) {
      if (results.errors.length > 0) {
        parseError.value = `Erreur de parsing : ${results.errors[0].message}`
        return
      }
      if (!results.meta.fields || results.meta.fields.length === 0) {
        parseError.value = 'Aucune colonne détectée dans le fichier'
        return
      }
      if (results.data.length === 0) {
        parseError.value = 'Le fichier ne contient aucune ligne de données'
        return
      }
      emit('parsed', { headers: results.meta.fields, rows: results.data })
    },
  })
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function reset() {
  fileName.value = ''
  parseError.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors"
      :class="isDragging ? 'border-primary bg-primary/5' : 'border-border'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <template v-if="!fileName">
        <Upload class="h-10 w-10 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">Glissez un fichier CSV ici ou</p>
        <label>
          <Button as="span" variant="outline" size="sm" class="cursor-pointer">
            Parcourir
          </Button>
          <input type="file" accept=".csv" class="hidden" @change="onFileInput" />
        </label>
      </template>
      <template v-else>
        <FileSpreadsheet class="h-10 w-10 text-primary" />
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium">{{ fileName }}</p>
          <button class="text-muted-foreground hover:text-destructive" @click="reset">
            <X class="h-4 w-4" />
          </button>
        </div>
      </template>
    </div>

    <p v-if="parseError" class="text-sm text-destructive">{{ parseError }}</p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add src/features/import/CsvUploader.vue
git commit -m "feat: add CsvUploader component with drag-and-drop (step 2)"
```

---

### Task 6: Créer le composant ColumnMapper (étape 3)

**Files:**
- Create: `src/features/import/ColumnMapper.vue`

**Step 1: Implémenter le composant**

```vue
<!-- src/features/import/ColumnMapper.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ImportType } from './import-schemas'
import { IMPORT_CONFIGS } from './import-schemas'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  csvHeaders: string[]
  mapping: Record<string, string>
  importType: ImportType
}>()

const emit = defineEmits<{
  (e: 'update:mapping', value: Record<string, string>): void
}>()

const config = computed(() => IMPORT_CONFIGS[props.importType])

const requiredFieldsMapped = computed(() => {
  const mappedKeys = new Set(Object.values(props.mapping).filter(Boolean))
  return config.value.fields
    .filter((f) => f.required)
    .every((f) => mappedKeys.has(f.key))
})

const fieldOptions = computed(() => [
  { key: '', label: '— Ignorer —' },
  ...config.value.fields.map((f) => ({
    key: f.key,
    label: `${f.label}${f.required ? ' *' : ''}`,
  })),
])

function updateField(csvHeader: string, fieldKey: string) {
  const newMapping = { ...props.mapping }
  newMapping[csvHeader] = fieldKey === 'NONE' ? '' : fieldKey
  emit('update:mapping', newMapping)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-sm" :class="requiredFieldsMapped ? 'text-green-700' : 'text-amber-700'">
      <CheckCircle2 v-if="requiredFieldsMapped" class="h-4 w-4" />
      <AlertCircle v-else class="h-4 w-4" />
      <span v-if="requiredFieldsMapped">Tous les champs obligatoires sont mappés</span>
      <span v-else>Des champs obligatoires (*) ne sont pas encore mappés</span>
    </div>

    <div class="space-y-2">
      <div
        v-for="header in csvHeaders"
        :key="header"
        class="flex items-center gap-3 rounded-lg border p-3"
      >
        <code class="min-w-[140px] shrink-0 rounded bg-muted px-2 py-1 text-xs font-medium">{{ header }}</code>
        <ArrowRight class="h-4 w-4 shrink-0 text-muted-foreground" />
        <Select :model-value="mapping[header] || 'NONE'" @update:model-value="(v) => updateField(header, v as string)">
          <SelectTrigger class="flex-1">
            <SelectValue placeholder="Ignorer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in fieldOptions" :key="opt.key || 'NONE'" :value="opt.key || 'NONE'">
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">* Champ obligatoire</p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add src/features/import/ColumnMapper.vue
git commit -m "feat: add ColumnMapper component with visual mapping (step 3)"
```

---

### Task 7: Créer le composant ImportPreview (étape 4)

**Files:**
- Create: `src/features/import/ImportPreview.vue`

**Step 1: Implémenter le composant**

```vue
<!-- src/features/import/ImportPreview.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ImportType } from './import-schemas'
import { IMPORT_CONFIGS, applyMapping, validateRow } from './import-schemas'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  rows: Record<string, string>[]
  mapping: Record<string, string>
  importType: ImportType
}>()

const config = computed(() => IMPORT_CONFIGS[props.importType])

const mappedFields = computed(() => {
  const usedKeys = new Set(Object.values(props.mapping).filter(Boolean))
  return config.value.fields.filter((f) => usedKeys.has(f.key))
})

const processedRows = computed(() => {
  return props.rows.map((csvRow, index) => {
    const mapped = applyMapping(csvRow, props.mapping, props.importType)
    const result = validateRow(mapped, props.importType)
    return {
      index: index + 1,
      data: mapped,
      valid: result.valid,
      errors: result.errors,
      validated: result.data,
    }
  })
})

const validCount = computed(() => processedRows.value.filter((r) => r.valid).length)
const errorCount = computed(() => processedRows.value.filter((r) => !r.valid).length)

const validRows = computed(() =>
  processedRows.value.filter((r) => r.valid).map((r) => r.validated!)
)

defineExpose({ validRows, validCount })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4 text-sm">
      <span class="flex items-center gap-1 text-green-700">
        <CheckCircle2 class="h-4 w-4" />
        {{ validCount }} ligne{{ validCount > 1 ? 's' : '' }} valide{{ validCount > 1 ? 's' : '' }}
      </span>
      <span v-if="errorCount > 0" class="flex items-center gap-1 text-destructive">
        <XCircle class="h-4 w-4" />
        {{ errorCount }} erreur{{ errorCount > 1 ? 's' : '' }}
      </span>
    </div>

    <div class="max-h-[400px] overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12">#</TableHead>
            <TableHead class="w-12">Statut</TableHead>
            <TableHead v-for="field in mappedFields" :key="field.key">{{ field.label }}</TableHead>
            <TableHead>Erreurs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in processedRows"
            :key="row.index"
            :class="!row.valid ? 'bg-red-50' : ''"
          >
            <TableCell class="text-xs text-muted-foreground">{{ row.index }}</TableCell>
            <TableCell>
              <CheckCircle2 v-if="row.valid" class="h-4 w-4 text-green-600" />
              <XCircle v-else class="h-4 w-4 text-destructive" />
            </TableCell>
            <TableCell v-for="field in mappedFields" :key="field.key" class="text-sm">
              {{ row.data[field.key] ?? '' }}
            </TableCell>
            <TableCell class="text-xs text-destructive">
              {{ row.errors.join(', ') }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add src/features/import/ImportPreview.vue
git commit -m "feat: add ImportPreview component with validation table (step 4)"
```

---

### Task 8: Créer la page ImportPage et le routing

**Files:**
- Create: `src/pages/ImportPage.vue`
- Modify: `src/app/router.ts:42-48`
- Modify: `src/layouts/AppShell.vue:33-39`

**Step 1: Créer ImportPage.vue**

```vue
<!-- src/pages/ImportPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ImportType } from '@/features/import/import-schemas'
import { autoMapColumns, IMPORT_CONFIGS } from '@/features/import/import-schemas'
import ImportTypePicker from '@/features/import/ImportTypePicker.vue'
import CsvUploader from '@/features/import/CsvUploader.vue'
import ColumnMapper from '@/features/import/ColumnMapper.vue'
import ImportPreview from '@/features/import/ImportPreview.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { useSpotsStore } from '@/stores/spots.store'
import { useCustomersStore } from '@/stores/customers.store'
import { importCustomers, importSpots, importReservations } from '@/services/import.service'
import type { ImportProgress } from '@/services/import.service'
import { ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-vue-next'

const spotsStore = useSpotsStore()
const customersStore = useCustomersStore()

// Stepper state
const step = ref(1)
const importType = ref<ImportType | null>(null)
const csvHeaders = ref<string[]>([])
const csvRows = ref<Record<string, string>[]>([])
const mapping = ref<Record<string, string>>({})
const previewRef = ref<InstanceType<typeof ImportPreview> | null>(null)

// Import state
const isImporting = ref(false)
const progress = ref<ImportProgress | null>(null)

const canGoNext = computed(() => {
  if (step.value === 1) return importType.value !== null
  if (step.value === 2) return csvHeaders.value.length > 0
  if (step.value === 3) {
    if (!importType.value) return false
    const config = IMPORT_CONFIGS[importType.value]
    const mappedKeys = new Set(Object.values(mapping.value).filter(Boolean))
    return config.fields.filter((f) => f.required).every((f) => mappedKeys.has(f.key))
  }
  if (step.value === 4) return (previewRef.value?.validCount ?? 0) > 0
  return false
})

const stepLabels = ['Type', 'Fichier', 'Mapping', 'Import']

function onCsvParsed(payload: { headers: string[]; rows: Record<string, string>[] }) {
  csvHeaders.value = payload.headers
  csvRows.value = payload.rows
  // Auto-map columns
  if (importType.value) {
    mapping.value = autoMapColumns(payload.headers, importType.value)
  }
}

function goNext() {
  if (canGoNext.value && step.value < 4) {
    step.value++
  }
}

function goBack() {
  if (step.value > 1) {
    step.value--
  }
}

function resetAll() {
  step.value = 1
  importType.value = null
  csvHeaders.value = []
  csvRows.value = []
  mapping.value = {}
  progress.value = null
  isImporting.value = false
}

async function handleImport() {
  if (!importType.value || !previewRef.value) return

  const validRows = previewRef.value.validRows
  if (validRows.length === 0) return

  isImporting.value = true
  progress.value = { total: validRows.length, done: 0, errors: [] }

  const onProgress = (p: ImportProgress) => { progress.value = p }

  try {
    let result: ImportProgress

    if (importType.value === 'customers') {
      result = await importCustomers(validRows, onProgress)
    } else if (importType.value === 'spots') {
      result = await importSpots(validRows, onProgress)
    } else {
      // Charger spots et clients pour la résolution des références
      if (spotsStore.spots.length === 0) await spotsStore.fetchSpots()
      if (customersStore.customers.length === 0) await customersStore.fetchCustomers()
      result = await importReservations(validRows, spotsStore.spots, customersStore.customers, onProgress)
    }

    if (result.errors.length === 0) {
      toast.success(`${result.done} ${IMPORT_CONFIGS[importType.value].label.toLowerCase()} importé(e)s avec succès`)
    } else {
      toast.warning(`${result.done - result.errors.length} importé(e)s, ${result.errors.length} erreur(s)`)
    }
  } catch {
    toast.error("Erreur inattendue lors de l'import")
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Import de données" description="Importez des données depuis un fichier CSV">
      <template #actions>
        <Button v-if="step > 1 || progress" variant="outline" @click="resetAll">
          Recommencer
        </Button>
      </template>
    </PageHeader>

    <!-- Stepper indicator -->
    <div class="flex items-center gap-2">
      <template v-for="(label, i) in stepLabels" :key="i">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
          :class="step > i + 1 ? 'bg-primary text-primary-foreground' : step === i + 1 ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'"
        >
          {{ i + 1 }}
        </div>
        <span class="text-sm" :class="step >= i + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'">{{ label }}</span>
        <div v-if="i < stepLabels.length - 1" class="h-px flex-1 bg-border" />
      </template>
    </div>

    <!-- Step content -->
    <div class="rounded-lg border bg-card p-6">
      <ImportTypePicker v-if="step === 1" v-model="importType" />
      <CsvUploader v-else-if="step === 2" @parsed="onCsvParsed" />
      <ColumnMapper
        v-else-if="step === 3 && importType"
        :csv-headers="csvHeaders"
        :mapping="mapping"
        :import-type="importType"
        @update:mapping="mapping = $event"
      />
      <div v-else-if="step === 4 && importType">
        <ImportPreview
          ref="previewRef"
          :rows="csvRows"
          :mapping="mapping"
          :import-type="importType"
        />

        <!-- Progress bar -->
        <div v-if="progress" class="mt-4 space-y-2">
          <div class="h-2 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full bg-primary transition-all"
              :style="{ width: `${(progress.done / progress.total) * 100}%` }"
            />
          </div>
          <p class="text-xs text-muted-foreground">{{ progress.done }} / {{ progress.total }}</p>
          <div v-if="progress.errors.length > 0" class="max-h-[150px] overflow-auto rounded border border-destructive/20 bg-red-50 p-2 text-xs text-destructive">
            <p v-for="err in progress.errors" :key="err.row">Ligne {{ err.row }} : {{ err.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="flex justify-between">
      <Button v-if="step > 1" variant="outline" @click="goBack" :disabled="isImporting">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Précédent
      </Button>
      <div v-else />

      <Button v-if="step < 4" @click="goNext" :disabled="!canGoNext">
        Suivant
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
      <Button v-else @click="handleImport" :disabled="!canGoNext || isImporting">
        <Loader2 v-if="isImporting" class="mr-2 h-4 w-4 animate-spin" />
        <Upload v-else class="mr-2 h-4 w-4" />
        {{ isImporting ? 'Import en cours...' : `Importer ${previewRef?.validCount ?? 0} lignes` }}
      </Button>
    </div>
  </div>
</template>
```

**Step 2: Ajouter la route dans router.ts**

Ajouter après la route `/settings` (ligne ~55) :

```typescript
  {
    path: '/import',
    name: 'import',
    component: () => import('@/pages/ImportPage.vue'),
    meta: { requiresAuth: true, title: 'Import de données' },
  },
```

**Step 3: Ajouter le lien dans la sidebar AppShell.vue**

Ajouter dans le tableau `navItems` (ligne ~39), entre settings et le dernier item :

```typescript
import { Upload } from 'lucide-vue-next'
// dans navItems :
  { name: 'import', label: 'Import', icon: Upload, to: '/import' },
```

Note : `Upload` doit être ajouté aux imports Lucide existants (ligne ~7-17).

**Step 4: Vérifier le type-check**

Run: `npx vue-tsc --noEmit`
Expected: pas d'erreurs

**Step 5: Commit**

```bash
git add src/pages/ImportPage.vue src/app/router.ts src/layouts/AppShell.vue
git commit -m "feat: add import page with stepper wizard and sidebar navigation"
```

---

### Task 9: Test end-to-end manuel

**Step 1: Lancer le serveur de dev**

Run: `npm run dev`

**Step 2: Tester le flow complet**

1. Se connecter, aller sur `/import`
2. Choisir "Clients", cliquer Suivant
3. Uploader un CSV de test avec colonnes `prenom,nom,courriel,telephone`
4. Vérifier que l'auto-mapping détecte les colonnes
5. Corriger si nécessaire, cliquer Suivant
6. Vérifier l'aperçu avec les lignes valides/invalides
7. Cliquer "Importer"

**Step 3: Lancer les tests unitaires**

Run: `npx vitest run`
Expected: tous les tests passent

**Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete CSV import wizard with mapping, validation and batch import"
```
