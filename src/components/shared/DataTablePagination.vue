<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

defineProps<{
  table: Table<unknown>
}>()
</script>

<template>
  <div class="flex items-center justify-between px-2 py-4">
    <div class="text-sm text-muted-foreground">
      {{ table.getFilteredRowModel().rows.length }} resultat(s)
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8"
        :disabled="!table.getCanPreviousPage()"
        @click="table.setPageIndex(0)"
      >
        <ChevronsLeft class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span class="text-sm text-muted-foreground">
        Page {{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}
      </span>
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8"
        :disabled="!table.getCanNextPage()"
        @click="table.setPageIndex(table.getPageCount() - 1)"
      >
        <ChevronsRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
