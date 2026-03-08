<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockOrders } from '~/data/mock'
import type { Order } from '~/types'
import { formatCurrency, formatDate } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

const viewMode = ref<'kanban' | 'table'>('kanban')
const searchQuery = ref('')
const selectedOrder = ref<Order | null>(null)
const showOrderModal = ref(false)

const orderStatuses = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { id: 'processing', label: 'Processing', color: 'bg-blue-500' },
  { id: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-rose-500' }
] as const

const orders = ref<Order[]>([...mockOrders])

const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value
  const query = searchQuery.value.toLowerCase()
  return orders.value.filter(order => 
    order.id.toLowerCase().includes(query) ||
    order.customer.name.toLowerCase().includes(query) ||
    order.customer.email.toLowerCase().includes(query)
  )
})

const ordersByStatus = computed(() => {
  const grouped: Record<string, Order[]> = {}
  orderStatuses.forEach(status => {
    grouped[status.id] = filteredOrders.value.filter(o => o.status === status.id)
  })
  return grouped
})

const draggedOrder = ref<Order | null>(null)

function onDragStart(order: Order) {
  draggedOrder.value = order
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(status: string) {
  if (draggedOrder.value) {
    const orderIndex = orders.value.findIndex(o => o.id === draggedOrder.value!.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex] = { ...orders.value[orderIndex], status: status as Order['status'] }
    }
    draggedOrder.value = null
  }
}

function viewOrder(order: Order) {
  selectedOrder.value = order
  showOrderModal.value = true
}

function closeModal() {
  showOrderModal.value = false
  selectedOrder.value = null
}

function updateOrderStatus(orderId: string, newStatus: Order['status']) {
  const orderIndex = orders.value.findIndex(o => o.id === orderId)
  if (orderIndex !== -1) {
    orders.value[orderIndex] = { ...orders.value[orderIndex], status: newStatus }
  }
  closeModal()
}

const getStatusColor = (status: string) => {
  const statusObj = orderStatuses.find(s => s.id === status)
  return statusObj?.color || 'bg-gray-500'
}

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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Orders</h1>
        <p class="text-muted-foreground">Manage and track customer orders</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex items-center rounded-lg bg-secondary p-1">
          <button
            @click="viewMode = 'kanban'"
            :class="[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Icon name="lucide:columns-3" class="mr-1.5 h-4 w-4" />
            Kanban
          </button>
          <button
            @click="viewMode = 'table'"
            :class="[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <Icon name="lucide:list" class="mr-1.5 h-4 w-4" />
            Table
          </button>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative max-w-md">
      <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search orders..."
        class="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>

    <!-- Kanban View -->
    <div v-if="viewMode === 'kanban'" class="flex gap-4 overflow-x-auto pb-4">
      <div
        v-for="status in orderStatuses"
        :key="status.id"
        class="min-w-[300px] flex-shrink-0"
        @dragover="onDragOver"
        @drop="onDrop(status.id)"
      >
        <!-- Column Header -->
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="['h-3 w-3 rounded-full', status.color]" />
            <h3 class="font-semibold text-foreground">{{ status.label }}</h3>
            <span class="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {{ ordersByStatus[status.id]?.length || 0 }}
            </span>
          </div>
        </div>

        <!-- Column Content -->
        <div class="min-h-[500px] space-y-3 rounded-xl bg-secondary/50 p-3">
          <div
            v-for="order in ordersByStatus[status.id]"
            :key="order.id"
            draggable="true"
            @dragstart="onDragStart(order)"
            @click="viewOrder(order)"
            class="cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div class="mb-3 flex items-start justify-between">
              <div>
                <p class="font-medium text-foreground">{{ order.id }}</p>
                <p class="text-sm text-muted-foreground">{{ order.customer.name }}</p>
              </div>
              <span class="text-sm font-semibold text-primary">{{ formatCurrency(order.total) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>{{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}</span>
              <span>{{ formatDate(order.createdAt) }}</span>
            </div>
            <div v-if="order.priority === 'high'" class="mt-2">
              <span class="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                <Icon name="lucide:alert-circle" class="mr-1 h-3 w-3" />
                High Priority
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!ordersByStatus[status.id]?.length" class="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p class="text-sm text-muted-foreground">No orders</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <table class="w-full">
        <thead class="border-b border-border bg-secondary/50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-secondary/30">
            <td class="px-4 py-3">
              <span class="font-medium text-foreground">{{ order.id }}</span>
            </td>
            <td class="px-4 py-3">
              <div>
                <p class="font-medium text-foreground">{{ order.customer.name }}</p>
                <p class="text-sm text-muted-foreground">{{ order.customer.email }}</p>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', getStatusBadgeClasses(order.status)]">
                {{ order.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-muted-foreground">{{ order.items.length }} items</td>
            <td class="px-4 py-3 font-medium text-foreground">{{ formatCurrency(order.total) }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ formatDate(order.createdAt) }}</td>
            <td class="px-4 py-3">
              <button
                @click="viewOrder(order)"
                class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon name="lucide:eye" class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Detail Modal -->
    <Teleport to="body">
      <div v-if="showOrderModal && selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="closeModal" />
        <div class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
          <!-- Modal Header -->
          <div class="mb-6 flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold text-foreground">Order {{ selectedOrder.id }}</h2>
              <p class="text-sm text-muted-foreground">Placed on {{ formatDate(selectedOrder.createdAt) }}</p>
            </div>
            <button @click="closeModal" class="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <!-- Customer Info -->
          <div class="mb-6 rounded-lg bg-secondary/50 p-4">
            <h3 class="mb-2 font-semibold text-foreground">Customer Information</h3>
            <div class="grid gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium text-foreground">{{ selectedOrder.customer.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Email:</span>
                <span class="font-medium text-foreground">{{ selectedOrder.customer.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Phone:</span>
                <span class="font-medium text-foreground">{{ selectedOrder.customer.phone || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="mb-6">
            <h3 class="mb-3 font-semibold text-foreground">Order Items</h3>
            <div class="space-y-3">
              <div v-for="item in selectedOrder.items" :key="item.productId" class="flex items-center gap-4 rounded-lg border border-border p-3">
                <div class="h-16 w-16 rounded-lg bg-secondary" />
                <div class="flex-1">
                  <p class="font-medium text-foreground">{{ item.name }}</p>
                  <p class="text-sm text-muted-foreground">Qty: {{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
                </div>
                <p class="font-semibold text-foreground">{{ formatCurrency(item.quantity * item.price) }}</p>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mb-6 rounded-lg bg-secondary/50 p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal:</span>
                <span class="text-foreground">{{ formatCurrency(selectedOrder.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping:</span>
                <span class="text-foreground">{{ formatCurrency(selectedOrder.shipping) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax:</span>
                <span class="text-foreground">{{ formatCurrency(selectedOrder.tax) }}</span>
              </div>
              <div class="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span class="text-foreground">Total:</span>
                <span class="text-primary">{{ formatCurrency(selectedOrder.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Status Update -->
          <div>
            <h3 class="mb-3 font-semibold text-foreground">Update Status</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in orderStatuses"
                :key="status.id"
                @click="updateOrderStatus(selectedOrder.id, status.id as Order['status'])"
                :class="[
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  selectedOrder.status === status.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                ]"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
