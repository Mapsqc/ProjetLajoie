<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  Users,
  Receipt,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Trees,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const route = useRoute()
const uiStore = useUiStore()
const authStore = useAuthStore()

const navItems = [
  { name: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard' },
  { name: 'reservations', label: 'Réservations', icon: BookOpen, to: '/reservations' },
  { name: 'spots', label: 'Emplacements', icon: MapPin, to: '/spots' },
  { name: 'customers', label: 'Clients', icon: Users, to: '/customers' },
  { name: 'fiscal', label: 'Fiscalité', icon: Receipt, to: '/fiscal' },
  { name: 'settings', label: 'Paramètres', icon: Settings, to: '/coming-soon', placeholder: true },
]

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Camping Lajoie'
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300"
      :class="uiStore.sidebarCollapsed ? 'w-16' : 'w-60'"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Trees class="h-5 w-5" />
        </div>
        <span
          v-if="!uiStore.sidebarCollapsed"
          class="truncate text-sm font-semibold text-foreground"
        >
          Camping Lajoie
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 p-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
          :class="{
            'bg-sidebar-active text-sidebar-active-foreground font-semibold hover:bg-sidebar-active hover:text-sidebar-active-foreground':
              route.path.startsWith(item.to) && item.to !== '/coming-soon',
            'opacity-50': item.placeholder,
          }"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span v-if="!uiStore.sidebarCollapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Collapse button -->
      <div class="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-center text-sidebar-foreground hover:bg-gray-100 hover:text-foreground"
          @click="uiStore.toggleSidebar()"
        >
          <PanelLeftClose v-if="!uiStore.sidebarCollapsed" class="h-4 w-4" />
          <PanelLeftOpen v-else class="h-4 w-4" />
        </Button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <h1 class="text-lg font-semibold text-foreground">{{ pageTitle }}</h1>
        <div class="flex items-center gap-3">
          <Badge variant="outline" class="hidden sm:inline-flex">Camping Lajoie</Badge>
          <Separator orientation="vertical" class="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="gap-2">
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {{ authStore.user?.name?.charAt(0) || 'A' }}
                </div>
                <span class="hidden text-sm sm:inline">
                  {{ authStore.user?.name || 'Admin' }}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem class="text-muted-foreground text-xs" disabled>
                {{ authStore.user?.email }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive cursor-pointer" @click="authStore.logout()">
                <LogOut class="mr-2 h-4 w-4" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
