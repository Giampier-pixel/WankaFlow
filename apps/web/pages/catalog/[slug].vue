<script setup lang="ts">
import { products } from '~/data/mock'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/lib/utils'

const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()

const product = computed(() => products.find(p => p.slug === route.params.slug))

if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found'
  })
}

const selectedImage = ref(0)
const quantity = ref(1)
const selectedVariants = ref<Record<string, string>>({})
const isAdding = ref(false)
const isZoomed = ref(false)

const stockStatus = computed(() => {
  if (!product.value) return null
  if (product.value.stock === 0) return { label: 'Out of Stock', class: 'bg-destructive text-destructive-foreground' }
  if (product.value.stock <= product.value.minStock) return { label: 'Low Stock', class: 'bg-warning text-warning-foreground' }
  return { label: 'In Stock', class: 'bg-success text-success-foreground' }
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  return products
    .filter(p => p.category === product.value!.category && p.id !== product.value!.id)
    .slice(0, 4)
})

const currentPrice = computed(() => {
  if (!product.value) return 0
  if (!authStore.isWholesale) return product.value.retailPrice

  // Check volume pricing
  const volumePrice = product.value.volumePricing.find(
    vp => quantity.value >= vp.minQty && (vp.maxQty === null || quantity.value <= vp.maxQty)
  )
  return volumePrice?.price || product.value.wholesalePrice
})

const addToCart = async () => {
  if (!product.value || product.value.stock === 0) return
  isAdding.value = true
  cartStore.addItem(product.value, quantity.value, selectedVariants.value)
  await new Promise(resolve => setTimeout(resolve, 500))
  isAdding.value = false
  cartStore.openDrawer()
}

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const incrementQty = () => {
  if (product.value && quantity.value < product.value.stock) quantity.value++
}
</script>

<template>
  <div v-if="product" class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-8">
        <NuxtLink to="/" class="text-muted-foreground hover:text-foreground transition-colors">Home</NuxtLink>
        <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
        <NuxtLink to="/catalog" class="text-muted-foreground hover:text-foreground transition-colors">Catalog</NuxtLink>
        <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
        <span class="text-foreground">{{ product.name }}</span>
      </nav>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <!-- Main Image -->
          <div
            class="relative aspect-square bg-secondary rounded-2xl overflow-hidden cursor-zoom-in"
            @click="isZoomed = true"
          >
            <img
              :src="product.images[selectedImage]"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <button
              class="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur rounded-lg"
            >
              <Icon name="lucide:zoom-in" class="w-5 h-5" />
            </button>
          </div>

          <!-- Thumbnails -->
          <div class="flex gap-3">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              :class="[
                'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'
              ]"
              @click="selectedImage = index"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm text-muted-foreground">{{ product.brand }}</span>
              <span
                :class="['px-2 py-1 text-xs font-medium rounded-full', stockStatus?.class]"
              >
                {{ stockStatus?.label }}
              </span>
            </div>
            <h1 class="text-3xl font-bold mb-2">{{ product.name }}</h1>
            <p class="text-sm text-muted-foreground">SKU: {{ product.sku }}</p>
          </div>

          <!-- Price Display -->
          <PriceDisplay
            :retail-price="product.retailPrice"
            :wholesale-price="product.wholesalePrice"
            size="lg"
          />

          <!-- Volume Pricing Table -->
          <div v-if="authStore.isWholesale && product.volumePricing.length > 0" class="bg-secondary/50 rounded-xl p-4">
            <h3 class="font-medium mb-3 flex items-center gap-2">
              <Icon name="lucide:layers" class="w-4 h-4 text-primary" />
              Volume Pricing
            </h3>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <div
                v-for="tier in product.volumePricing"
                :key="tier.minQty"
                :class="[
                  'p-3 rounded-lg text-center border transition-colors',
                  quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background'
                ]"
              >
                <p class="text-muted-foreground text-xs mb-1">
                  {{ tier.minQty }}-{{ tier.maxQty || '99+' }} units
                </p>
                <p class="font-semibold">{{ formatCurrency(tier.price) }}</p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="font-medium mb-2">Description</h3>
            <p class="text-muted-foreground leading-relaxed">{{ product.description }}</p>
          </div>

          <!-- Variants -->
          <div v-if="product.variants && product.variants.length > 0" class="space-y-4">
            <div v-for="variant in product.variants" :key="variant.id">
              <label class="text-sm font-medium mb-2 block">{{ variant.name }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in variant.options"
                  :key="option"
                  :class="[
                    'px-4 py-2 border rounded-lg text-sm transition-all',
                    selectedVariants[variant.name] === option
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  ]"
                  @click="selectedVariants[variant.name] = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity & Add to Cart -->
          <div class="flex items-center gap-4">
            <div class="flex items-center border border-border rounded-lg">
              <button
                class="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                :disabled="quantity <= 1"
                @click="decrementQty"
              >
                <Icon name="lucide:minus" class="w-4 h-4" />
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="w-16 h-10 text-center border-0 focus:outline-none"
              />
              <button
                class="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                :disabled="quantity >= product.stock"
                @click="incrementQty"
              >
                <Icon name="lucide:plus" class="w-4 h-4" />
              </button>
            </div>

            <button
              :disabled="product.stock === 0 || isAdding"
              :class="[
                'flex-1 h-12 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
                product.stock === 0
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              ]"
              @click="addToCart"
            >
              <Icon v-if="isAdding" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
              <Icon v-else name="lucide:shopping-cart" class="w-5 h-5" />
              {{ product.stock === 0 ? 'Out of Stock' : isAdding ? 'Adding...' : `Add to Cart - ${formatCurrency(currentPrice * quantity)}` }}
            </button>
          </div>

          <!-- Stock Info -->
          <p v-if="product.stock > 0 && product.stock <= 10" class="text-sm text-warning flex items-center gap-2">
            <Icon name="lucide:alert-triangle" class="w-4 h-4" />
            Only {{ product.stock }} items left in stock
          </p>
        </div>
      </div>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold mb-8">Related Products</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </section>
    </div>

    <!-- Image Zoom Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isZoomed"
          class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          @click="isZoomed = false"
        >
          <button
            class="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            @click="isZoomed = false"
          >
            <Icon name="lucide:x" class="w-6 h-6" />
          </button>
          <img
            :src="product.images[selectedImage]"
            :alt="product.name"
            class="max-w-full max-h-full object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Hide number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
