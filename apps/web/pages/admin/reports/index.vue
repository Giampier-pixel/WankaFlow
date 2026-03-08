<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockOrders, mockProducts, mockCustomers } from '~/data/mock'
import { formatCurrency } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

const dateRange = ref('30d')
const reportType = ref('overview')

const dateRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
]

const reportTypes = [
  { value: 'overview', label: 'Overview', icon: 'lucide:bar-chart-3' },
  { value: 'sales', label: 'Sales', icon: 'lucide:dollar-sign' },
  { value: 'products', label: 'Products', icon: 'lucide:package' },
  { value: 'customers', label: 'Customers', icon: 'lucide:users' }
]

// Calculate stats
const totalRevenue = computed(() => mockOrders.reduce((sum, o) => sum + o.total, 0))
const totalOrders = computed(() => mockOrders.length)
const averageOrderValue = computed(() => totalRevenue.value / totalOrders.value)
const totalCustomers = computed(() => mockCustomers.length)

// Top products
const topProducts = computed(() => {
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
  
  mockOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].revenue += item.quantity * item.price
    })
  })
  
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
})

// Top customers
const topCustomers = computed(() => {
  return [...mockCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
})

// Sales by status
const ordersByStatus = computed(() => {
  const statuses: Record<string, number> = {}
  mockOrders.forEach(order => {
    statuses[order.status] = (statuses[order.status] || 0) + 1
  })
  return Object.entries(statuses).map(([status, count]) => ({ status, count }))
})

// Monthly revenue (mock data)
const monthlyRevenue = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 }
]

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Reports</h1>
        <p class="text-muted-foreground">Analytics and business insights</p>
      </div>
      <div class="flex gap-2">
        <select
          v-model="dateRange"
          class="rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option v-for="range in dateRanges" :key="range.value" :value="range.value">{{ range.label }}</option>
        </select>
        <button class="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
          <Icon name="lucide:download" class="h-4 w-4" />
          Export
        </button>
      </div>
    </div>

    <!-- Report Type Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="type in reportTypes"
        :key="type.value"
        @click="reportType = type.value"
        :class="[
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
          reportType === type.value
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        ]"
      >
        <Icon :name="type.icon" class="h-4 w-4" />
        {{ type.label }}
      </button>
    </div>

    <!-- Overview Report -->
    <div v-if="reportType === 'overview'" class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Revenue</p>
              <p class="text-3xl font-bold text-foreground">{{ formatCurrency(totalRevenue) }}</p>
              <p class="mt-1 text-sm text-emerald-600">+12.5% from last period</p>
            </div>
            <div class="rounded-full bg-emerald-100 p-3">
              <Icon name="lucide:dollar-sign" class="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Orders</p>
              <p class="text-3xl font-bold text-foreground">{{ totalOrders }}</p>
              <p class="mt-1 text-sm text-emerald-600">+8.2% from last period</p>
            </div>
            <div class="rounded-full bg-blue-100 p-3">
              <Icon name="lucide:shopping-cart" class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Avg. Order Value</p>
              <p class="text-3xl font-bold text-foreground">{{ formatCurrency(averageOrderValue) }}</p>
              <p class="mt-1 text-sm text-emerald-600">+4.1% from last period</p>
            </div>
            <div class="rounded-full bg-purple-100 p-3">
              <Icon name="lucide:trending-up" class="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Customers</p>
              <p class="text-3xl font-bold text-foreground">{{ totalCustomers }}</p>
              <p class="mt-1 text-sm text-emerald-600">+15.3% from last period</p>
            </div>
            <div class="rounded-full bg-amber-100 p-3">
              <Icon name="lucide:users" class="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Revenue Chart -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-6 text-lg font-semibold text-foreground">Revenue Trend</h3>
          <div class="flex items-end gap-2 h-48">
            <div
              v-for="month in monthlyRevenue"
              :key="month.month"
              class="flex-1 flex flex-col items-center gap-2"
            >
              <div
                class="w-full rounded-t-lg bg-primary transition-all hover:bg-primary/80"
                :style="{ height: `${(month.revenue / maxRevenue) * 100}%` }"
              />
              <span class="text-xs text-muted-foreground">{{ month.month }}</span>
            </div>
          </div>
        </div>

        <!-- Orders by Status -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-6 text-lg font-semibold text-foreground">Orders by Status</h3>
          <div class="space-y-4">
            <div v-for="item in ordersByStatus" :key="item.status" class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium capitalize text-foreground">{{ item.status }}</span>
                  <span class="text-sm text-muted-foreground">{{ item.count }} orders</span>
                </div>
                <div class="h-2 rounded-full bg-secondary">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{ width: `${(item.count / totalOrders) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Report -->
    <div v-if="reportType === 'sales'" class="space-y-6">
      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Sales Summary</h3>
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-lg bg-secondary/50 p-4">
            <p class="text-sm text-muted-foreground">Gross Sales</p>
            <p class="text-2xl font-bold text-foreground">{{ formatCurrency(totalRevenue * 1.15) }}</p>
          </div>
          <div class="rounded-lg bg-secondary/50 p-4">
            <p class="text-sm text-muted-foreground">Discounts</p>
            <p class="text-2xl font-bold text-rose-600">-{{ formatCurrency(totalRevenue * 0.08) }}</p>
          </div>
          <div class="rounded-lg bg-secondary/50 p-4">
            <p class="text-sm text-muted-foreground">Net Sales</p>
            <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(totalRevenue) }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Sales by Category</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <span class="font-medium text-foreground">Electronics</span>
            <span class="text-foreground">{{ formatCurrency(totalRevenue * 0.35) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <span class="font-medium text-foreground">Apparel</span>
            <span class="text-foreground">{{ formatCurrency(totalRevenue * 0.28) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <span class="font-medium text-foreground">Home & Garden</span>
            <span class="text-foreground">{{ formatCurrency(totalRevenue * 0.22) }}</span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <span class="font-medium text-foreground">Other</span>
            <span class="text-foreground">{{ formatCurrency(totalRevenue * 0.15) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Report -->
    <div v-if="reportType === 'products'" class="space-y-6">
      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Top Selling Products</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="pb-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                <th class="pb-3 text-right text-sm font-medium text-muted-foreground">Units Sold</th>
                <th class="pb-3 text-right text-sm font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(product, index) in topProducts" :key="index" class="hover:bg-secondary/30">
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {{ index + 1 }}
                    </span>
                    <span class="font-medium text-foreground">{{ product.name }}</span>
                  </div>
                </td>
                <td class="py-3 text-right text-foreground">{{ product.quantity }}</td>
                <td class="py-3 text-right font-medium text-foreground">{{ formatCurrency(product.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold text-foreground">Inventory Status</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">In Stock</span>
              <span class="font-medium text-emerald-600">{{ mockProducts.filter(p => p.stock > 10).length }} products</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Low Stock</span>
              <span class="font-medium text-amber-600">{{ mockProducts.filter(p => p.stock > 0 && p.stock <= 10).length }} products</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Out of Stock</span>
              <span class="font-medium text-rose-600">{{ mockProducts.filter(p => p.stock === 0).length }} products</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold text-foreground">Product Performance</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Total Products</span>
              <span class="font-medium text-foreground">{{ mockProducts.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Avg. Price</span>
              <span class="font-medium text-foreground">{{ formatCurrency(mockProducts.reduce((sum, p) => sum + p.price, 0) / mockProducts.length) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Total Stock Value</span>
              <span class="font-medium text-foreground">{{ formatCurrency(mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customers Report -->
    <div v-if="reportType === 'customers'" class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border bg-card p-6">
          <p class="text-sm text-muted-foreground">Total Customers</p>
          <p class="text-3xl font-bold text-foreground">{{ mockCustomers.length }}</p>
        </div>
        <div class="rounded-xl border border-border bg-card p-6">
          <p class="text-sm text-muted-foreground">Wholesale Customers</p>
          <p class="text-3xl font-bold text-foreground">{{ mockCustomers.filter(c => c.tier === 'wholesale').length }}</p>
        </div>
        <div class="rounded-xl border border-border bg-card p-6">
          <p class="text-sm text-muted-foreground">VIP Customers</p>
          <p class="text-3xl font-bold text-foreground">{{ mockCustomers.filter(c => c.tier === 'vip').length }}</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Top Customers by Revenue</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="pb-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                <th class="pb-3 text-left text-sm font-medium text-muted-foreground">Tier</th>
                <th class="pb-3 text-right text-sm font-medium text-muted-foreground">Orders</th>
                <th class="pb-3 text-right text-sm font-medium text-muted-foreground">Total Spent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="(customer, index) in topCustomers" :key="customer.id" class="hover:bg-secondary/30">
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {{ customer.name.split(' ').map(n => n[0]).join('') }}
                    </span>
                    <div>
                      <p class="font-medium text-foreground">{{ customer.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ customer.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize text-foreground">
                    {{ customer.tier }}
                  </span>
                </td>
                <td class="py-3 text-right text-foreground">{{ customer.totalOrders }}</td>
                <td class="py-3 text-right font-medium text-foreground">{{ formatCurrency(customer.totalSpent) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
