<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn } from 'lucide-vue-next'

const authStore = useAuthStore()
const email = ref('admin@camping.com')
const password = ref('admin123')

async function handleSubmit() {
  try {
    await authStore.login({ email: email.value, password: password.value })
  } catch {
    // error is handled by the store
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-center">Connexion</CardTitle>
      <CardDescription class="text-center">
        Entrez vos identifiants pour acceder au panneau
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Courriel</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@camping.com"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="password">Mot de passe</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="********"
            required
          />
        </div>

        <div
          v-if="authStore.error"
          class="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {{ authStore.error }}
        </div>

        <Button type="submit" class="w-full" :disabled="authStore.isLoading">
          <LogIn v-if="!authStore.isLoading" class="mr-2 h-4 w-4" />
          {{ authStore.isLoading ? 'Connexion...' : 'Se connecter' }}
        </Button>

        <div class="rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p class="font-medium">Identifiants de demo :</p>
          <p>Courriel : admin@camping.com</p>
          <p>Mot de passe : admin123</p>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
