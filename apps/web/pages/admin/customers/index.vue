<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockCustomers } from '~/data/mock'
import { formatCurrency, formatDate } from '~/lib/utils'

definePageMeta({
  layout: 'admin'
})

const searchQuery = ref('')
const selectedTier = ref('all')
const sortBy = ref('name')

const tiers = [
  { value: 'all', label: 'All Tiers' },
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'vip', label: 'VIP' }
]

const filteredCustomers = computed(() => {
  let customers = [...mockCustomers]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.company?.toLowerCase().includes(query)
    )
  }
  
  if (selectedTier.value !== 'all') {
    customers = customers.filter(c => c.tier === selectedTier.value)
  }
  
  customers.sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    if (sortBy.value === 'totalSpent') return b.totalSpent - a.totalSpent
    if (sortBy.value === 'orders') return b.totalOrders - a.totalOrders
    return 0
  })
  
  return customers
})

const getTierBadgeClasses = (tier: string) => {
  const colors: Record<string, string> = {
    retail: 'bg-blue-100 text-blue-800',
    wholesale: 'bg-purple-100 text-purple-800',
    vip: 'bg-amber-100 text-amber-800'
  }
  return colors[tier] || 'bg-gray-100 text-gray-800'
}

const stats = computed(() => ({
  total: mockCustomers.length,
  wholesale: mockCustomers.filter(c => c.tier === 'wholesale').length,
  vip: mockCustomers.filter(c => c.tier === 'vip').length,
  totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Customers</h1>
        <p class="text-muted-foreground">Manage your customer relationships</p>
      </div>
      <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Icon name="lucide:user-plus" class="h-4 w-4" />
        Add Customer
      </button>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Customers</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
          </div>
          <div class="rounded-full bg-primary/10 p-3">
            <Icon name="lucide:users" class="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Wholesale</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.wholesale }}</p>
          </div>
          <div class="rounded-full bg-purple-100 p-3">
            <Icon name="lucide:building" class="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">VIP Members</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.vip }}</p>
          </div>
          <div class="rounded-full bg-amber-100 p-3">
            <Icon name="lucide:crown" class="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">Total Revenue</p>
            <p class="text-2xl font-bold text-foreground">{{ formatCurrency(stats.totalRevenue) }}</p>
          </div>
          <div class="rounded-full bg-emerald-100 p-3">
            <Icon name="lucide:dollar-sign" class="h-5 w-5 text-emerald-600" />
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
          placeholder="Search customers..."
          class="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <select
        v-model="selectedTier"
        class="rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option v-for="tier in tiers" :key="tier.value" :value="tier.value">{{ tier.label }}</option>
      </select>
      <select
        v-model="sortBy"
        class="rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="name">Sort by Name</option>
        <option value="totalSpent">Sort by Spent</option>
        <option value="orders">Sort by Orders</option>
      </select>
    </div>

    <!-- Customer List -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <table class="w-full">
        <thead class="border-b border-border bg-secondary/50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
            <th class="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground lg:table-cell">Company</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tier</th>
            <th class="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">Orders</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spent</th>
            <th class="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">Last Order</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-secondary/30">
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                  {{ customer.name.split(' ').map(n => n[0]).join('') }}
                </div>
                <div>
                  <p class="font-medium text-foreground">{{ customer.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ customer.email }}</p>
                </div>
              </div>
            </td>
            <td class="hidden px-4 py-4 lg:table-cell">
              <span class="text-foreground">{{ customer.company || '-' }}</span>
            </td>
            <td class="px-4 py-4">
              <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', getTierBadgeClasses(customer.tier)]">
                {{ customer.tier }}
              </span>
            </td>
            <td class="hidden px-4 py-4 sm:table-cell">
              <span class="text-foreground">{{ customer.totalOrders }}</span>
            </td>
            <td class="px-4 py-4">
              <span class="font-medium text-foreground">{{ formatCurrency(customer.totalSpent) }}</span>
            </td>
            <td class="hidden px-4 py-4 md:table-cell">
              <span class="text-muted-foreground">{{ formatDate(customer.lastOrderDate) }}</span>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-1">
                <NuxtLink
                  :to="`/admin/customers/${customer.id}`"
                  class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Icon name="lucide:eye" class="h-4 w-4" />
                </NuxtLink>
                <button class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Icon name="lucide:mail" class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
