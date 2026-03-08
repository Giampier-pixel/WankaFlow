import { defineStore } from 'pinia'
import type { CartItem, Product } from '~/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  couponCode: string | null
  couponDiscount: number
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    isOpen: false,
    couponCode: null,
    couponDiscount: 0
  }),

  getters: {
    itemCount: (state): number => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },

    subtotal(): number {
      const authStore = useAuthStore()
      return this.items.reduce((sum, item) => {
        const price = authStore.isWholesale 
          ? item.product.wholesalePrice 
          : item.product.retailPrice
        return sum + price * item.quantity
      }, 0)
    },

    shipping(): number {
      if (this.subtotal === 0) return 0
      if (this.subtotal >= 100) return 0 // Free shipping over $100
      return 9.99
    },

    tax(): number {
      return this.subtotal * 0.08 // 8% tax
    },

    discount(): number {
      return this.subtotal * (this.couponDiscount / 100)
    },

    total(): number {
      return this.subtotal + this.shipping + this.tax - this.discount
    },

    isEmpty: (state): boolean => state.items.length === 0
  },

  actions: {
    addItem(product: Product, quantity: number = 1, variants?: Record<string, string>) {
      const existingItem = this.items.find(
        item => item.product.id === product.id && 
        JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
      )

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          selectedVariants: variants
        })
      }
    },

    removeItem(itemId: string) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find(item => item.id === itemId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(itemId)
        } else {
          item.quantity = Math.min(quantity, item.product.stock)
        }
      }
    },

    applyCoupon(code: string) {
      // Mock coupon validation
      const validCoupons: Record<string, number> = {
        'SAVE10': 10,
        'SAVE20': 20,
        'WHOLESALE15': 15
      }

      if (validCoupons[code.toUpperCase()]) {
        this.couponCode = code.toUpperCase()
        this.couponDiscount = validCoupons[code.toUpperCase()]
        return { success: true, discount: this.couponDiscount }
      }

      return { success: false, error: 'Invalid coupon code' }
    },

    removeCoupon() {
      this.couponCode = null
      this.couponDiscount = 0
    },

    clearCart() {
      this.items = []
      this.couponCode = null
      this.couponDiscount = 0
    },

    toggleDrawer() {
      this.isOpen = !this.isOpen
    },

    openDrawer() {
      this.isOpen = true
    },

    closeDrawer() {
      this.isOpen = false
    }
  }
})
