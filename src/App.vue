<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppShell from '@/layouts/AppShell.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Toaster } from '@/components/ui/sonner'

const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <AuthLayout v-if="route.meta.layout === 'auth' || route.name === 'not-found'">
    <RouterView />
  </AuthLayout>
  <AppShell v-else>
    <RouterView />
  </AppShell>
  <Toaster position="top-right" :duration="3000" />
</template>
