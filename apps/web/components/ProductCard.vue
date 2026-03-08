<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { formatCurrency } from '~/lib/utils'
import type { Product } from '~/types'

const props = defineProps<{
  product: Product
  view?: 'grid' | 'list'
}>()

const authStore = useAuthStore()
const cartStore = useCartStore()

const isAdding = ref(false)

const stockStatus = computed(() => {
  if (props.product.stock === 0) return { label: 'Out of Stock', class: 'bg-destructive/10 text-destructive' }
  if (props.product.stock <= props.product.minStock) return { label: 'Low Stock', class: 'bg-warning/10 text-warning' }
  return { label: 'In Stock', class: 'bg-success/10 text-success' }
})

const addToCart = async () => {
  if (props.product.stock === 0) return
  isAdding.value = true
  cartStore.addItem(props.product, 1)
  await new Promise(resolve => setTimeout(resolve, 500))
  isAdding.value = false
}
</script>

<template>
  <div
    :class="[
      'group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all',
      view === 'list' ? 'flex' : ''
    ]"
  >
    <!-- Image -->
    <NuxtLink
      :to="`/catalog/${product.slug}`"
      :class="[
        'block relative overflow-hidden bg-secondary',
        view === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
      ]"
    >
      <img
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <!-- Stock Badge -->
      <span
        :class="[
          'absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full',
          stockStatus.class
        ]"
      >
        {{ stockStatus.label }}
      </span>
    </NuxtLink>

    <!-- Content -->
    <div :class="['p-4 flex flex-col', view === 'list' ? 'flex-1' : '']">
      <NuxtLink :to="`/catalog/${product.slug}`">
        <p class="text-xs text-muted-foreground mb-1">{{ product.brand }}</p>
        <h3 class="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <p v-if="view === 'list'" class="text-sm text-muted-foreground mt-2 line-clamp-2">
        {{ product.description }}
      </p>

      <!-- Pricing -->
      <div class="mt-3 space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">{{ formatCurrency(product.retailPrice) }}</span>
        </div>
        
        <!-- Wholesale Price -->
        <div v-if="authStore.isWholesale" class="flex items-center gap-2">
          <span class="text-sm text-primary font-medium">
            Wholesale: {{ formatCurrency(product.wholesalePrice) }}
          </span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full blur-sm select-none">
            $XX.XX
          </span>
          <NuxtLink to="/login" class="text-xs text-primary hover:underline">
            Login for wholesale
          </NuxtLink>
        </div>
      </div>

      <!-- Add to Cart -->
      <button
        :disabled="product.stock === 0 || isAdding"
        :class="[
          'mt-4 w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
          product.stock === 0
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        ]"
        @click="addToCart"
      >
        <Icon v-if="isAdding" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        <Icon v-else name="lucide:shopping-cart" class="w-4 h-4" />
        {{ product.stock === 0 ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart' }}
      </button>
    </div>
  </div>
</template>
