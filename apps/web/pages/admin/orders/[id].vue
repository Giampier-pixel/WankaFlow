<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockOrders } from '~/data/mock'
import type { Order } from '~/types'
import { formatCurrency, formatDate } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const order = computed(() => mockOrders.find(o => o.id === route.params.id) || null)

const orderStatuses = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { id: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { id: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-rose-500' }
]

const getStatusBadgeClasses = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const timeline = computed(() => {
  if (!order.value) return []
  return [
    { status: 'Order Placed', date: order.value.createdAt, completed: true },
    { status: 'Processing', date: order.value.createdAt, completed: ['processing', 'shipped', 'delivered'].includes(order.value.status) },
    { status: 'Shipped', date: order.value.createdAt, completed: ['shipped', 'delivered'].includes(order.value.status) },
    { status: 'Delivered', date: order.value.createdAt, completed: order.value.status === 'delivered' }
  ]
})
</script>

<template>
  <div v-if="order" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <button @click="router.back()" class="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
        <Icon name="lucide:arrow-left" class="h-5 w-5" />
      </button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-foreground">Order {{ order.id }}</h1>
        <p class="text-muted-foreground">Placed on {{ formatDate(order.createdAt) }}</p>
      </div>
      <span :class="['rounded-full px-3 py-1.5 text-sm font-medium capitalize', getStatusBadgeClasses(order.status)]">
        {{ order.status }}
      </span>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Order Items -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Order Items</h2>
          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-4">
              <div class="h-20 w-20 rounded-lg bg-secondary" />
              <div class="flex-1">
                <p class="font-medium text-foreground">{{ item.name }}</p>
                <p class="text-sm text-muted-foreground">SKU: {{ item.productId }}</p>
                <p class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-foreground">{{ formatCurrency(item.quantity * item.price) }}</p>
                <p class="text-sm text-muted-foreground">{{ formatCurrency(item.price) }} each</p>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="mt-6 border-t border-border pt-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span class="text-foreground">{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span class="text-foreground">{{ formatCurrency(order.shipping) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax</span>
                <span class="text-foreground">{{ formatCurrency(order.tax) }}</span>
              </div>
              <div class="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span class="text-foreground">Total</span>
                <span class="text-primary">{{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Timeline -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Order Timeline</h2>
          <div class="relative">
            <div class="absolute left-4 top-0 h-full w-0.5 bg-border" />
            <div class="space-y-6">
              <div v-for="(event, index) in timeline" :key="index" class="relative flex gap-4 pl-10">
                <div
                  :class="[
                    'absolute left-2 top-1 h-5 w-5 rounded-full border-2',
                    event.completed ? 'border-primary bg-primary' : 'border-border bg-card'
                  ]"
                >
                  <Icon v-if="event.completed" name="lucide:check" class="h-full w-full p-0.5 text-primary-foreground" />
                </div>
                <div>
                  <p :class="['font-medium', event.completed ? 'text-foreground' : 'text-muted-foreground']">{{ event.status }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatDate(event.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Customer Info -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Customer</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {{ order.customer.name.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-foreground">{{ order.customer.name }}</p>
                <p class="text-sm text-muted-foreground">{{ order.customer.email }}</p>
              </div>
            </div>
            <NuxtLink 
              :to="`/admin/customers/${order.customer.id}`"
              class="inline-flex items-center text-sm text-primary hover:underline"
            >
              View Customer Profile
              <Icon name="lucide:arrow-right" class="ml-1 h-4 w-4" />
            </NuxtLink>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Shipping Address</h2>
          <div class="text-sm text-muted-foreground">
            <p class="font-medium text-foreground">{{ order.customer.name }}</p>
            <p>{{ order.shippingAddress?.street || '123 Main Street' }}</p>
            <p>{{ order.shippingAddress?.city || 'San Francisco' }}, {{ order.shippingAddress?.state || 'CA' }} {{ order.shippingAddress?.zip || '94102' }}</p>
            <p>{{ order.shippingAddress?.country || 'United States' }}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Payment</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Method</span>
              <span class="text-foreground capitalize">{{ order.paymentMethod || 'Credit Card' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status</span>
              <span class="text-emerald-600">Paid</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Actions</h2>
          <div class="space-y-2">
            <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Icon name="lucide:printer" class="h-4 w-4" />
              Print Invoice
            </button>
            <button class="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Icon name="lucide:mail" class="h-4 w-4" />
              Send Email
            </button>
            <button class="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Icon name="lucide:download" class="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex h-96 items-center justify-center">
    <p class="text-muted-foreground">Order not found</p>
  </div>
</template>
