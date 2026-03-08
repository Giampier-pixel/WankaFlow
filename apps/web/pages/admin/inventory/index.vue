<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockProducts, mockInventoryMovements } from '~/data/mock'
import { formatDate } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

const searchQuery = ref('')
const filterStatus = ref('all')
const showAdjustModal = ref(false)
const selectedProduct = ref<typeof mockProducts[0] | null>(null)
const adjustmentQuantity = ref(0)
const adjustmentReason = ref('')

const statusFilters = [
  { value: 'all', label: 'All Items' },
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' }
]

const filteredProducts = computed(() => {
  let products = [...mockProducts]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value !== 'all') {
    products = products.filter(p => {
      if (filterStatus.value === 'out-of-stock') return p.stock === 0
      if (filterStatus.value === 'low-stock') return p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)
      if (filterStatus.value === 'in-stock') return p.stock > (p.lowStockThreshold || 10)
      return true
    })
  }
  
  return products
})

const stats = computed(() => ({
  totalProducts: mockProducts.length,
  totalStock: mockProducts.reduce((sum, p) => sum + p.stock, 0),
  lowStock: mockProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length,
  outOfStock: mockProducts.filter(p => p.stock === 0).length
}))

const getStockStatus = (product: typeof mockProducts[0]) => {
  if (product.stock === 0) return { label: 'Out of Stock', class: 'bg-rose-100 text-rose-800' }
  if (product.stock <= (product.lowStockThreshold || 10)) return { label: 'Low Stock', class: 'bg-amber-100 text-amber-800' }
  return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-800' }
}

function openAdjustModal(product: typeof mockProducts[0]) {
  selectedProduct.value = product
  adjustmentQuantity.value = 0
  adjustmentReason.value = ''
  showAdjustModal.value = true
}

function closeAdjustModal() {
  showAdjustModal.value = false
  selectedProduct.value = null
}

function submitAdjustment() {
  // In a real app, this would make an API call
  closeAdjustModal()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Inventory</h1>
        <p class="text-muted-foreground">Track and manage product stock levels</p>
      </div>
      <div class="flex gap-2">
        <button class="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
          <Icon name="lucide:download" class="h-4 w-4" />
          Export
        </button>
        <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Icon name="lucide:upload" class="h-4 w-4" />
          Import Stock
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Products</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalProducts }}</p>
          </div>
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="lucide:package" class="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Stock</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalStock.toLocaleString() }}</p>
          </div>
          <div class="rounded-full bg-blue-100 p-3">
            <Icon name="lucide:boxes" class="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Low Stock</p>
            <p class="text-2xl font-bold text-amber-600">{{ stats.lowStock }}</p>
          </div>
          <div class="rounded-full bg-amber-100 p-3">
            <Icon name="lucide:alert-triangle" class="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Out of Stock</p>
            <p class="text-2xl font-bold text-rose-600">{{ stats.outOfStock }}</p>
          </div>
          <div class="rounded-full bg-rose-100 p-3">
            <Icon name="lucide:package-x" class="h-5 w-5 text-rose-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="relative flex-1 max-w-md">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or SKU..."
          class="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <select
        v-model="filterStatus"
        class="rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option v-for="status in statusFilters" :key="status.value" :value="status.value">{{ status.label }}</option>
      </select>
    </div>

    <!-- Inventory Table -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <table class="w-full">
        <thead class="border-b border-border bg-secondary/50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
            <th class="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">SKU</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
            <th class="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">Threshold</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-secondary/30">
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-lg bg-secondary" />
                <div>
                  <p class="font-medium text-foreground">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground sm:hidden">{{ product.sku }}</p>
                </div>
              </div>
            </td>
            <td class="hidden px-4 py-4 sm:table-cell">
              <span class="font-mono text-sm text-muted-foreground">{{ product.sku }}</span>
            </td>
            <td class="px-4 py-4">
              <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', getStockStatus(product).class]">
                {{ getStockStatus(product).label }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-foreground">{{ product.stock }}</span>
                <span class="text-muted-foreground">units</span>
              </div>
            </td>
            <td class="hidden px-4 py-4 md:table-cell">
              <span class="text-muted-foreground">{{ product.lowStockThreshold || 10 }} units</span>
            </td>
            <td class="px-4 py-4">
              <button
                @click="openAdjustModal(product)"
                class="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/80"
              >
                <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
                Adjust
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Recent Movements -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="mb-4 text-lg font-semibold text-foreground">Recent Stock Movements</h2>
      <div class="space-y-4">
        <div v-for="movement in mockInventoryMovements.slice(0, 5)" :key="movement.id" class="flex items-center gap-4">
          <div :class="[
            'flex h-10 w-10 items-center justify-center rounded-full',
            movement.type === 'in' ? 'bg-emerald-100' : movement.type === 'out' ? 'bg-rose-100' : 'bg-amber-100'
          ]">
            <Icon
              :name="movement.type === 'in' ? 'lucide:arrow-down' : movement.type === 'out' ? 'lucide:arrow-up' : 'lucide:refresh-cw'"
              :class="[
                'h-5 w-5',
                movement.type === 'in' ? 'text-emerald-600' : movement.type === 'out' ? 'text-rose-600' : 'text-amber-600'
              ]"
            />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">{{ movement.productName }}</p>
            <p class="text-sm text-muted-foreground">{{ movement.reason }}</p>
          </div>
          <div class="text-right">
            <p :class="[
              'font-medium',
              movement.type === 'in' ? 'text-emerald-600' : movement.type === 'out' ? 'text-rose-600' : 'text-foreground'
            ]">
              {{ movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '' }}{{ movement.quantity }}
            </p>
            <p class="text-sm text-muted-foreground">{{ formatDate(movement.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Adjust Stock Modal -->
    <Teleport to="body">
      <div v-if="showAdjustModal && selectedProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="closeAdjustModal" />
        <div class="relative z-10 w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-foreground">Adjust Stock</h2>
            <button @click="closeAdjustModal" class="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>

          <div class="mb-4">
            <p class="font-medium text-foreground">{{ selectedProduct.name }}</p>
            <p class="text-sm text-muted-foreground">Current stock: {{ selectedProduct.stock }} units</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-foreground">Adjustment Quantity</label>
              <input
                v-model.number="adjustmentQuantity"
                type="number"
                placeholder="Enter quantity (+/-)"
                class="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p class="mt-1 text-sm text-muted-foreground">
                New stock: {{ selectedProduct.stock + adjustmentQuantity }} units
              </p>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-foreground">Reason</label>
              <select
                v-model="adjustmentReason"
                class="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a reason</option>
                <option value="restock">Restock</option>
                <option value="return">Customer Return</option>
                <option value="damaged">Damaged/Lost</option>
                <option value="correction">Inventory Correction</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="closeAdjustModal"
                class="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                @click="submitAdjustment"
                class="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
