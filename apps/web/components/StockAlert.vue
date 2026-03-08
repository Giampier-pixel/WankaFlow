<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()

const urgency = computed(() => {
  return (product: Product) => {
    if (product.stock === 0) return 'critical'
    if (product.stock <= product.minStock / 2) return 'warning'
    return 'low'
  }
})

const urgencyStyles = {
  critical: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    badge: 'bg-destructive text-destructive-foreground'
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    badge: 'bg-warning text-warning-foreground'
  },
  low: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    badge: 'bg-primary text-primary-foreground'
  }
}
</script>

<template>
  <div
    :class="[
      'p-4 rounded-xl border',
      urgencyStyles[urgency(product)].bg,
      urgencyStyles[urgency(product)].border
    ]"
  >
    <div class="flex items-start gap-3">
      <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background">
        <img
          :src="product.images[0]"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-medium text-sm truncate">{{ product.name }}</h4>
            <p class="text-xs text-muted-foreground">SKU: {{ product.sku }}</p>
          </div>
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full flex-shrink-0',
              urgencyStyles[urgency(product)].badge
            ]"
          >
            {{ product.stock === 0 ? 'Out of Stock' : `${product.stock} left` }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-3">
          <span class="text-xs text-muted-foreground">
            Min. stock: {{ product.minStock }} units
          </span>
          <button
            class="px-3 py-1.5 text-xs font-medium bg-background hover:bg-secondary rounded-lg transition-colors"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
