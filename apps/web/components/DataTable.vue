<script setup lang="ts" generic="T">
export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

const props = defineProps<{
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  loading?: boolean
  emptyMessage?: string
}>()

const emit = defineEmits<{
  (e: 'select', items: T[]): void
  (e: 'sort', key: string, direction: 'asc' | 'desc'): void
  (e: 'row-click', item: T): void
}>()

const selectedItems = ref<Set<number>>(new Set())
const sortKey = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')

const allSelected = computed(() => 
  props.data.length > 0 && selectedItems.value.size === props.data.length
)

const toggleAll = () => {
  if (allSelected.value) {
    selectedItems.value.clear()
  } else {
    selectedItems.value = new Set(props.data.map((_, i) => i))
  }
  emit('select', props.data.filter((_, i) => selectedItems.value.has(i)))
}

const toggleItem = (index: number) => {
  if (selectedItems.value.has(index)) {
    selectedItems.value.delete(index)
  } else {
    selectedItems.value.add(index)
  }
  emit('select', props.data.filter((_, i) => selectedItems.value.has(i)))
}

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  emit('sort', key, sortDirection.value)
}
</script>

<template>
  <div class="border border-border rounded-xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-secondary/50">
          <tr>
            <th v-if="selectable" class="w-12 px-4 py-3">
              <input
                type="checkbox"
                :checked="allSelected"
                class="w-4 h-4 rounded border-border"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width }"
              :class="[
                'px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right',
                column.sortable && 'cursor-pointer hover:text-foreground select-none'
              ]"
              @click="column.sortable && handleSort(column.key)"
            >
              <div class="flex items-center gap-1" :class="column.align === 'right' && 'justify-end'">
                {{ column.label }}
                <Icon
                  v-if="column.sortable && sortKey === column.key"
                  :name="sortDirection === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  class="w-4 h-4"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-12">
              <div class="flex flex-col items-center justify-center gap-3">
                <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-primary" />
                <span class="text-sm text-muted-foreground">Loading...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="data.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="px-4 py-12">
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="lucide:inbox" class="w-6 h-6 text-muted-foreground" />
                </div>
                <span class="text-sm text-muted-foreground">{{ emptyMessage || 'No data available' }}</span>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-else
            v-for="(item, index) in data"
            :key="index"
            class="hover:bg-secondary/30 transition-colors cursor-pointer"
            @click="emit('row-click', item)"
          >
            <td v-if="selectable" class="px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedItems.has(index)"
                class="w-4 h-4 rounded border-border"
                @change="toggleItem(index)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              ]"
            >
              <slot :name="`cell-${column.key}`" :item="item" :value="(item as any)[column.key]">
                {{ (item as any)[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
