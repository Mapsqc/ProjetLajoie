<script setup lang="ts">
import { Trees } from 'lucide-vue-next'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
    <div class="w-full max-w-md space-y-6 p-8">
      <div class="flex flex-col items-center gap-2">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Trees class="h-8 w-8" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">Camping Lajoie</h1>
        <p class="text-sm text-muted-foreground">Panneau d'administration</p>
      </div>
      <slot />
    </div>
  </div>
</template>
