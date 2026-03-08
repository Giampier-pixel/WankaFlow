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
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="cartStore.isOpen"
        class="fixed inset-0 bg-black/50 z-50"
        @click="cartStore.closeDrawer"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="cartStore.isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 class="text-lg font-semibold">Shopping Cart</h2>
          <button
            class="p-2 hover:bg-secondary rounded-lg transition-colors"
            @click="cartStore.closeDrawer"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="cartStore.isEmpty" class="flex-1 flex flex-col items-center justify-center p-8">
          <div class="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Icon name="lucide:shopping-cart" class="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-medium mb-2">Your cart is empty</h3>
          <p class="text-sm text-muted-foreground text-center mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <NuxtLink
            to="/catalog"
            class="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            @click="cartStore.closeDrawer"
          >
            Browse Products
          </NuxtLink>
        </div>

        <!-- Cart Items -->
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="flex gap-4 p-3 bg-secondary/50 rounded-xl"
          >
            <img
              :src="item.product.images[0]"
              :alt="item.product.name"
              class="w-20 h-20 object-cover rounded-lg"
            />
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-sm truncate">{{ item.product.name }}</h4>
              <p class="text-sm text-muted-foreground">{{ formatCurrency(getPrice(item.product)) }}</p>
              
              <!-- Quantity Controls -->
              <div class="flex items-center gap-2 mt-2">
                <button
                  class="w-7 h-7 flex items-center justify-center bg-background border border-border rounded-md hover:bg-secondary transition-colors"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  <Icon name="lucide:minus" class="w-3 h-3" />
                </button>
                <span class="w-8 text-center text-sm font-medium">{{ item.quantity }}</span>
                <button
                  class="w-7 h-7 flex items-center justify-center bg-background border border-border rounded-md hover:bg-secondary transition-colors"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  :disabled="item.quantity >= item.product.stock"
                >
                  <Icon name="lucide:plus" class="w-3 h-3" />
                </button>
              </div>
            </div>
            <div class="flex flex-col items-end justify-between">
              <button
                class="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-destructive"
                @click="cartStore.removeItem(item.id)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
              <span class="text-sm font-medium">
                {{ formatCurrency(getPrice(item.product) * item.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!cartStore.isEmpty" class="border-t border-border p-4 space-y-4">
          <!-- Coupon -->
          <div class="space-y-2">
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
            <p v-if="couponError" class="text-xs text-destructive">{{ couponError }}</p>
            <div v-if="cartStore.couponCode" class="flex items-center justify-between text-sm">
              <span class="text-success">Coupon "{{ cartStore.couponCode }}" applied</span>
              <button
                class="text-muted-foreground hover:text-foreground"
                @click="cartStore.removeCoupon"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtotal</span>
              <span>{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Shipping</span>
              <span>{{ cartStore.shipping === 0 ? 'Free' : formatCurrency(cartStore.shipping) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Tax</span>
              <span>{{ formatCurrency(cartStore.tax) }}</span>
            </div>
            <div v-if="cartStore.discount > 0" class="flex justify-between text-success">
              <span>Discount</span>
              <span>-{{ formatCurrency(cartStore.discount) }}</span>
            </div>
            <div class="flex justify-between text-base font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span>{{ formatCurrency(cartStore.total) }}</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <NuxtLink
            to="/checkout"
            class="block w-full py-3 bg-primary text-primary-foreground font-medium text-center rounded-lg hover:bg-primary/90 transition-colors"
            @click="cartStore.closeDrawer"
          >
            Checkout
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
