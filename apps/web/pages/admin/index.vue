<script setup lang="ts">
import { orders, products, customers, notifications, salesData, categoryPieData } from '~/data/mock'
import { formatCurrency, formatDateTime } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

// Stats
const todaysSales = computed(() => {
  return orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
})

const pendingOrders = computed(() => orders.filter(o => o.status === 'pending').length)

const lowStockItems = computed(() => 
  products.filter(p => p.stock <= p.minStock && p.stock > 0).length
)

const outOfStockItems = computed(() => products.filter(p => p.stock === 0).length)

const newCustomers = computed(() => 
  customers.filter(c => {
    const created = new Date(c.createdAt)
    const now = new Date()
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  }).length
)

const recentOrders = computed(() => orders.slice(0, 5))

const lowStockProducts = computed(() => 
  products.filter(p => p.stock <= p.minStock).slice(0, 4)
)

const liveNotifications = computed(() => 
  notifications.filter(n => !n.read).slice(0, 5)
)

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  paid: 'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  shipped: 'bg-success/10 text-success',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive'
}

// Simple chart rendering
const maxSalesValue = Math.max(...salesData.datasets[0].data)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground">Welcome back! Here's an overview of your store.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Today's Sales"
        :value="formatCurrency(todaysSales)"
        :change="12.5"
        trend="up"
        icon="lucide:dollar-sign"
        icon-bg="bg-success"
      />
      <StatsCard
        title="Pending Orders"
        :value="pendingOrders"
        :change="-3"
        trend="down"
        icon="lucide:clock"
        icon-bg="bg-warning"
      />
      <StatsCard
        title="Low Stock Items"
        :value="lowStockItems + outOfStockItems"
        :change="2"
        trend="up"
        icon="lucide:package"
        icon-bg="bg-destructive"
      />
      <StatsCard
        title="New Customers"
        :value="newCustomers"
        :change="8"
        trend="up"
        icon="lucide:users"
        icon-bg="bg-primary"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Sales Chart -->
      <div class="lg:col-span-2 bg-card border border-border rounded-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="font-semibold">Sales Overview</h2>
            <p class="text-sm text-muted-foreground">Last 7 days performance</p>
          </div>
          <select class="h-9 px-3 bg-secondary border-0 rounded-lg text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        
        <!-- Simple Bar Chart -->
        <div class="h-64 flex items-end gap-2">
          <div
            v-for="(value, index) in salesData.datasets[0].data"
            :key="index"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div
              class="w-full bg-primary/80 hover:bg-primary rounded-t-md transition-colors cursor-pointer"
              :style="{ height: `${(value / maxSalesValue) * 100}%` }"
              :title="`${salesData.labels[index]}: ${formatCurrency(value)}`"
            />
            <span class="text-xs text-muted-foreground">{{ salesData.labels[index] }}</span>
          </div>
        </div>
      </div>

      <!-- Category Pie Chart -->
      <div class="bg-card border border-border rounded-xl p-6">
        <h2 class="font-semibold mb-6">Sales by Category</h2>
        
        <!-- Simple Legend-based display -->
        <div class="space-y-4">
          <div
            v-for="item in categoryPieData"
            :key="item.name"
            class="flex items-center gap-3"
          >
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: item.color }"
            />
            <span class="flex-1 text-sm">{{ item.name }}</span>
            <span class="text-sm font-medium">{{ item.value }}%</span>
          </div>
        </div>
        
        <!-- Progress bars -->
        <div class="mt-6 space-y-2">
          <div
            v-for="item in categoryPieData"
            :key="item.name"
            class="h-2 bg-secondary rounded-full overflow-hidden"
          >
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: `${item.value}%`, backgroundColor: item.color }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Recent Orders -->
      <div class="lg:col-span-2 bg-card border border-border rounded-xl">
        <div class="p-4 border-b border-border flex items-center justify-between">
          <h2 class="font-semibold">Recent Orders</h2>
          <NuxtLink to="/admin/orders" class="text-sm text-primary hover:underline">
            View All
          </NuxtLink>
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ order.id }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                    statusColors[order.status]
                  ]"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ order.customerName }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium">{{ formatCurrency(order.total) }}</p>
              <p class="text-xs text-muted-foreground">{{ formatDateTime(order.createdAt) }}</p>
            </div>
            <button class="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Icon name="lucide:chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Stock Alerts + Live Feed -->
      <div class="space-y-6">
        <!-- Stock Alerts -->
        <div class="bg-card border border-border rounded-xl">
          <div class="p-4 border-b border-border flex items-center justify-between">
            <h2 class="font-semibold">Stock Alerts</h2>
            <NuxtLink to="/admin/inventory" class="text-sm text-primary hover:underline">
              View All
            </NuxtLink>
          </div>
          <div class="p-4 space-y-3">
            <StockAlert
              v-for="product in lowStockProducts"
              :key="product.id"
              :product="product"
            />
            <div v-if="lowStockProducts.length === 0" class="text-center py-4 text-muted-foreground text-sm">
              All products are well stocked
            </div>
          </div>
        </div>

        <!-- Live Activity Feed -->
        <div class="bg-card border border-border rounded-xl">
          <div class="p-4 border-b border-border flex items-center gap-2">
            <div class="w-2 h-2 bg-success rounded-full animate-pulse" />
            <h2 class="font-semibold">Live Activity</h2>
          </div>
          <div class="divide-y divide-border max-h-80 overflow-y-auto">
            <div
              v-for="notification in liveNotifications"
              :key="notification.id"
              class="p-4 hover:bg-secondary/30 transition-colors"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    notification.type === 'order' && 'bg-primary/10 text-primary',
                    notification.type === 'stock' && 'bg-warning/10 text-warning',
                    notification.type === 'customer' && 'bg-success/10 text-success'
                  ]"
                >
                  <Icon
                    :name="
                      notification.type === 'order' ? 'lucide:shopping-bag' :
                      notification.type === 'stock' ? 'lucide:package' :
                      'lucide:user'
                    "
                    class="w-4 h-4"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ notification.title }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ notification.message }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
