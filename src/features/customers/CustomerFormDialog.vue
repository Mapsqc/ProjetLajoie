<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Customer } from '@/types'
import { useCustomersStore } from '@/stores/customers.store'
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
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  customer?: Customer
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const customersStore = useCustomersStore()
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  province: '',
})

watch(() => props.open, (open) => {
  if (open && props.customer) {
    form.value = {
      firstName: props.customer.firstName,
      lastName: props.customer.lastName,
      email: props.customer.email,
      phone: props.customer.phone,
      city: props.customer.city || '',
      province: props.customer.province || '',
    }
  } else if (open) {
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      province: '',
    }
  }
  errors.value = {}
})

function validate(): boolean {
  errors.value = {}

  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'Le prénom est requis'
  }
  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Le nom est requis'
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Le courriel est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) {
    errors.value.email = 'Le format du courriel est invalide'
  }
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Le téléphone est requis'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  try {
    if (props.customer) {
      // Pour l'instant, on ne peut que créer. La modification sera ajoutée plus tard si nécessaire
      toast.error('La modification n\'est pas encore disponible')
    } else {
      await customersStore.createCustomer({
        firstName: form.value.firstName.trim(),
        lastName: form.value.lastName.trim(),
        email: form.value.email.trim(),
        phone: form.value.phone.trim(),
      })
      toast.success('Client créé avec succès')
    }
    emit('update:open', false)
  } catch (err) {
    console.error('Erreur sauvegarde client:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (errorMessage === 'EMAIL_UNIQUE') {
      errors.value.email = 'Un client avec ce courriel existe déjà'
    } else {
      toast.error(errorMessage)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ customer ? 'Modifier le client' : 'Nouveau client' }}</DialogTitle>
        <DialogDescription>
          {{ customer ? 'Modifiez les informations du client' : 'Remplissez les informations pour créer un nouveau client' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="firstName">Prénom</Label>
            <Input id="firstName" v-model="form.firstName" />
            <p v-if="errors.firstName" class="text-xs text-destructive">{{ errors.firstName }}</p>
          </div>
          <div class="space-y-2">
            <Label for="lastName">Nom</Label>
            <Input id="lastName" v-model="form.lastName" />
            <p v-if="errors.lastName" class="text-xs text-destructive">{{ errors.lastName }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="email">Courriel</Label>
            <Input id="email" type="email" v-model="form.email" />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </div>
          <div class="space-y-2">
            <Label for="phone">Téléphone</Label>
            <Input id="phone" v-model="form.phone" />
            <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="city">Ville</Label>
            <Input id="city" v-model="form.city" />
          </div>
          <div class="space-y-2">
            <Label for="province">Province</Label>
            <Input id="province" v-model="form.province" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'En cours...' : (customer ? 'Modifier' : 'Créer') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
