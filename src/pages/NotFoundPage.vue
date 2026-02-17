<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <h2 class="text-6xl font-bold text-muted-foreground/30">404</h2>
    <h3 class="mt-4 text-xl font-semibold">Page introuvable</h3>
    <p class="mt-2 text-muted-foreground">La page que vous cherchez n'existe pas.</p>
    <Button class="mt-6" @click="router.push({ name: 'dashboard' })">
      Retour au tableau de bord
    </Button>
  </div>
</template>
