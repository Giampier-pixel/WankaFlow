<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/lib/utils'

const cartStore = useCartStore()
const authStore = useAuthStore()

const couponInput = ref('')
const couponError = ref('')

const applyCoupon = () => {
  if (!couponInput.value.trim()) return
  const result = cartStore.applyCoupon(couponInput.value)
  if (!result.success) {
    couponError.value = result.error || 'Invalid coupon'
  } else {
    couponError.value = ''
    couponInput.value = ''
  }
}

const getPrice = (product: any) => {
  return authStore.isWholesale ? product.wholesalePrice : product.retailPrice
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>

      <!-- Empty Cart State -->
      <div v-if="cartStore.isEmpty" class="max-w-md mx-auto text-center py-16">
        <div class="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="lucide:shopping-cart" class="w-16 h-16 text-muted-foreground" />
        </div>
        <h2 class="text-2xl font-semibold mb-3">Your cart is empty</h2>
        <p class="text-muted-foreground mb-8">
          Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
        </p>
        <NuxtLink
          to="/catalog"
          class="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Icon name="lucide:shopping-bag" class="w-5 h-5" />
          Browse Products
        </NuxtLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex gap-4 p-4 bg-card border border-border rounded-xl"
          >
            <NuxtLink :to="`/catalog/${item.product.slug}`" class="flex-shrink-0">
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="w-24 h-24 object-cover rounded-lg"
              />
            </NuxtLink>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <NuxtLink :to="`/catalog/${item.product.slug}`" class="font-medium hover:text-primary transition-colors">
                    {{ item.product.name }}
                  </NuxtLink>
                  <p class="text-sm text-muted-foreground mt-1">{{ item.product.brand }}</p>
                  <div v-if="item.selectedVariants" class="flex gap-2 mt-2">
                    <span
                      v-for="(value, key) in item.selectedVariants"
                      :key="key"
                      class="text-xs px-2 py-1 bg-secondary rounded"
                    >
                      {{ key }}: {{ value }}
                    </span>
                  </div>
                </div>
                <button
                  class="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                  @click="cartStore.removeItem(item.id)"
                >
                  <Icon name="lucide:trash-2" class="w-5 h-5" />
                </button>
              </div>

              <div class="flex items-center justify-between mt-4">
                <div class="flex items-center border border-border rounded-lg">
                  <button
                    class="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                    @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                  >
                    <Icon name="lucide:minus" class="w-4 h-4" />
                  </button>
                  <span class="w-10 text-center text-sm font-medium">{{ item.quantity }}</span>
                  <button
                    class="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                    :disabled="item.quantity >= item.product.stock"
                    @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  >
                    <Icon name="lucide:plus" class="w-4 h-4" />
                  </button>
                </div>
                <div class="text-right">
                  <p class="font-semibold">{{ formatCurrency(getPrice(item.product) * item.quantity) }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatCurrency(getPrice(item.product)) }} each</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Continue Shopping -->
          <NuxtLink
            to="/catalog"
            class="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
            Continue Shopping
          </NuxtLink>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h2 class="text-lg font-semibold mb-6">Order Summary</h2>

            <!-- Coupon -->
            <div class="mb-6 pb-6 border-b border-border">
              <div class="flex gap-2">
                <input
                  v-model="couponInput"
                  type="text"
                  placeholder="Coupon code"
                  class="flex-1 h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  class="px-4 h-10 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                  @click="applyCoupon"
                >
                  Apply
                </button>
              </div>
              <p v-if="couponError" class="text-xs text-destructive mt-2">{{ couponError }}</p>
              <div v-if="cartStore.couponCode" class="flex items-center justify-between mt-3 text-sm text-success">
                <span>Coupon "{{ cartStore.couponCode }}" applied</span>
                <button
                  class="text-muted-foreground hover:text-foreground"
                  @click="cartStore.removeCoupon"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Summary -->
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal ({{ cartStore.itemCount }} items)</span>
                <span>{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span>{{ cartStore.shipping === 0 ? 'Free' : formatCurrency(cartStore.shipping) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Estimated Tax</span>
                <span>{{ formatCurrency(cartStore.tax) }}</span>
              </div>
              <div v-if="cartStore.discount > 0" class="flex justify-between text-success">
                <span>Discount</span>
                <span>-{{ formatCurrency(cartStore.discount) }}</span>
              </div>
            </div>

            <div class="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-border">
              <span>Total</span>
              <span>{{ formatCurrency(cartStore.total) }}</span>
            </div>

            <!-- Checkout Button -->
            <NuxtLink
              to="/checkout"
              class="block w-full py-3 mt-6 bg-primary text-primary-foreground font-medium text-center rounded-lg hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout
            </NuxtLink>

            <!-- Trust Badges -->
            <div class="mt-6 pt-6 border-t border-border">
              <div class="flex items-center justify-center gap-4 text-muted-foreground">
                <div class="flex items-center gap-1 text-xs">
                  <Icon name="lucide:shield-check" class="w-4 h-4" />
                  Secure
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <Icon name="lucide:lock" class="w-4 h-4" />
                  Encrypted
                </div>
                <div class="flex items-center gap-1 text-xs">
                  <Icon name="lucide:credit-card" class="w-4 h-4" />
                  Safe Payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
