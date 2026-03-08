<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'About', href: '#' },
  { name: 'Contact', href: '#' }
]

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(() => route.path, closeMobileMenu)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="lucide:zap" class="w-5 h-5 text-primary-foreground" />
            </div>
            <span class="text-xl font-bold text-foreground">WankaFlow</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.name"
              :to="link.href"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              :class="{ 'text-foreground': route.path === link.href }"
            >
              {{ link.name }}
            </NuxtLink>
          </nav>

          <!-- Search Bar (Desktop) -->
          <div class="hidden lg:flex flex-1 max-w-md mx-8">
            <div class="relative w-full">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-2">
            <!-- Mobile Search Toggle -->
            <button
              class="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="isSearchOpen = !isSearchOpen"
            >
              <Icon name="lucide:search" class="w-5 h-5" />
            </button>

            <!-- Cart -->
            <button
              class="relative p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="cartStore.toggleDrawer"
            >
              <Icon name="lucide:shopping-cart" class="w-5 h-5" />
              <span
                v-if="cartStore.itemCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center"
              >
                {{ cartStore.itemCount }}
              </span>
            </button>

            <!-- User Menu -->
            <div v-if="authStore.isAuthenticated" class="relative group">
              <button class="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="lucide:user" class="w-4 h-4 text-primary" />
                </div>
                <span class="hidden sm:block text-sm font-medium">{{ authStore.user?.name }}</span>
                <Icon name="lucide:chevron-down" class="w-4 h-4 hidden sm:block" />
              </button>
              <div class="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div class="p-2">
                  <div class="px-3 py-2 text-sm text-muted-foreground border-b border-border mb-2">
                    {{ authStore.user?.email }}
                    <span class="block text-xs mt-1 text-primary">{{ authStore.user?.role }}</span>
                  </div>
                  <NuxtLink
                    v-if="authStore.isAdmin"
                    to="/admin"
                    class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Icon name="lucide:layout-dashboard" class="w-4 h-4" />
                    Admin Dashboard
                  </NuxtLink>
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
            <div v-else class="flex items-center gap-2">
              <NuxtLink
                to="/login"
                class="hidden sm:flex px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
              >
                Login
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
              >
                Sign Up
              </NuxtLink>
            </div>

            <!-- Mobile Menu Toggle -->
            <button
              class="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <Icon :name="isMobileMenuOpen ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div v-if="isSearchOpen" class="lg:hidden pb-4">
          <div class="relative">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-border bg-background"
      >
        <nav class="container mx-auto px-4 py-4 flex flex-col gap-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.name"
            :to="link.href"
            class="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors"
            :class="{ 'bg-secondary': route.path === link.href }"
          >
            {{ link.name }}
          </NuxtLink>
          <div v-if="!authStore.isAuthenticated" class="border-t border-border mt-2 pt-4 flex flex-col gap-2">
            <NuxtLink
              to="/login"
              class="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-lg transition-colors text-center"
            >
              Login
            </NuxtLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-secondary/50 border-t border-border mt-auto">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="lucide:zap" class="w-5 h-5 text-primary-foreground" />
              </div>
              <span class="text-xl font-bold">WankaFlow</span>
            </div>
            <p class="text-sm text-muted-foreground">
              Your trusted B2B/B2C e-commerce platform with wholesale pricing and fast shipping.
            </p>
            <div class="flex items-center gap-3">
              <a href="#" class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Icon name="lucide:facebook" class="w-5 h-5" />
              </a>
              <a href="#" class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Icon name="lucide:twitter" class="w-5 h-5" />
              </a>
              <a href="#" class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Icon name="lucide:instagram" class="w-5 h-5" />
              </a>
              <a href="#" class="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Icon name="lucide:linkedin" class="w-5 h-5" />
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h4 class="font-semibold mb-4">Customer Service</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Track Order</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Returns</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Wholesale Program</a></li>
              <li><a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>

          <!-- Payment Methods -->
          <div>
            <h4 class="font-semibold mb-4">We Accept</h4>
            <div class="flex flex-wrap gap-2">
              <div class="px-3 py-2 bg-background rounded-lg border border-border">
                <Icon name="lucide:credit-card" class="w-6 h-6" />
              </div>
              <div class="px-3 py-2 bg-background rounded-lg border border-border">
                <Icon name="lucide:landmark" class="w-6 h-6" />
              </div>
              <div class="px-3 py-2 bg-background rounded-lg border border-border">
                <Icon name="lucide:wallet" class="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-muted-foreground">
            2024 WankaFlow. All rights reserved.
          </p>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Cart Drawer -->
    <CartDrawer />
  </div>
</template>
