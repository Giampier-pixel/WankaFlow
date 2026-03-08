<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { notifications } from '~/data/mock'

const authStore = useAuthStore()
const route = useRoute()

const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)
const isNotificationsOpen = ref(false)

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: 'lucide:layout-dashboard' },
  { name: 'Products', href: '/admin/products', icon: 'lucide:package' },
  { name: 'Orders', href: '/admin/orders', icon: 'lucide:shopping-bag' },
  { name: 'Customers', href: '/admin/customers', icon: 'lucide:users' },
  { name: 'Inventory', href: '/admin/inventory', icon: 'lucide:warehouse' },
  { name: 'Reports', href: '/admin/reports', icon: 'lucide:bar-chart-3' },
  { name: 'Settings', href: '/admin/settings', icon: 'lucide:settings' }
]

const unreadCount = computed(() => notifications.filter(n => !n.read).length)

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((part, index) => ({
    name: part.charAt(0).toUpperCase() + part.slice(1),
    href: '/' + parts.slice(0, index + 1).join('/')
  }))
})

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

watch(() => route.path, closeMobileSidebar)

// Check if user is admin
onMounted(() => {
  if (!authStore.isAuthenticated) {
    authStore.loginAsDemo('ADMIN')
  }
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300',
        isSidebarCollapsed ? 'w-16' : 'w-64',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-border">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="lucide:zap" class="w-5 h-5 text-primary-foreground" />
          </div>
          <span v-if="!isSidebarCollapsed" class="text-xl font-bold">WankaFlow</span>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="p-3 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            route.path === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          ]"
        >
          <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!isSidebarCollapsed" class="text-sm font-medium">{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <!-- Collapse Toggle (Desktop) -->
      <button
        class="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 p-2 hover:bg-secondary rounded-lg transition-colors"
        @click="isSidebarCollapsed = !isSidebarCollapsed"
      >
        <Icon
          :name="isSidebarCollapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'"
          class="w-5 h-5"
        />
      </button>
    </aside>

    <!-- Main Content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      ]"
    >
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b border-border">
        <div class="flex items-center justify-between h-full px-4">
          <!-- Left: Mobile Menu + Breadcrumbs -->
          <div class="flex items-center gap-4">
            <button
              class="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="isMobileSidebarOpen = true"
            >
              <Icon name="lucide:menu" class="w-5 h-5" />
            </button>

            <!-- Breadcrumbs -->
            <nav class="hidden sm:flex items-center gap-2 text-sm">
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.href">
                <span v-if="index > 0" class="text-muted-foreground">/</span>
                <NuxtLink
                  :to="crumb.href"
                  :class="[
                    'transition-colors',
                    index === breadcrumbs.length - 1
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  ]"
                >
                  {{ crumb.name }}
                </NuxtLink>
              </template>
            </nav>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <!-- Back to Store -->
            <NuxtLink
              to="/"
              class="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Icon name="lucide:store" class="w-4 h-4" />
              View Store
            </NuxtLink>

            <!-- Notifications -->
            <div class="relative">
              <button
                class="relative p-2 hover:bg-secondary rounded-lg transition-colors"
                @click="isNotificationsOpen = !isNotificationsOpen"
              >
                <Icon name="lucide:bell" class="w-5 h-5" />
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center"
                >
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Notifications Dropdown -->
              <div
                v-if="isNotificationsOpen"
                class="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg"
              >
                <div class="p-4 border-b border-border">
                  <h3 class="font-semibold">Notifications</h3>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    :class="[
                      'p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-primary/5'
                    ]"
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
                        <p class="text-xs text-muted-foreground mt-0.5">{{ notification.message }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-3 border-t border-border">
                  <button class="w-full text-sm text-primary hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>

            <!-- User Menu -->
            <div class="relative group">
              <button class="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-primary-foreground">
                    {{ authStore.user?.name?.charAt(0) || 'A' }}
                  </span>
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium">{{ authStore.user?.name || 'Admin' }}</p>
                  <p class="text-xs text-muted-foreground">Administrator</p>
                </div>
                <Icon name="lucide:chevron-down" class="w-4 h-4 hidden sm:block" />
              </button>
              <div class="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div class="p-2">
                  <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="lucide:user" class="w-4 h-4" />
                    Profile
                  </a>
                  <a href="#" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors">
                    <Icon name="lucide:settings" class="w-4 h-4" />
                    Settings
                  </a>
                  <hr class="my-2 border-border" />
                  <button
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors text-destructive"
                    @click="authStore.logout"
                  >
                    <Icon name="lucide:log-out" class="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
