<script setup lang="ts">
import { products, categories } from '~/data/mock'
import { formatCurrency } from '~/lib/utils'

const featuredProducts = computed(() => products.slice(0, 8))

const email = ref('')
const isSubscribing = ref(false)

const subscribe = async () => {
  if (!email.value) return
  isSubscribing.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isSubscribing.value = false
  email.value = ''
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%234F46E5%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      <div class="container mx-auto px-4 py-20 lg:py-32 relative">
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6">
            B2B & B2C E-Commerce Platform
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Wholesale & Retail Products at
            <span class="text-primary">Unbeatable Prices</span>
          </h1>
          <p class="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join thousands of businesses and individuals who trust WankaFlow for quality products, competitive wholesale pricing, and lightning-fast shipping.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NuxtLink
              to="/catalog"
              class="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="lucide:shopping-bag" class="w-5 h-5" />
              Shop Now
            </NuxtLink>
            <NuxtLink
              to="/register?type=wholesale"
              class="w-full sm:w-auto px-8 py-3.5 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="lucide:building-2" class="w-5 h-5" />
              Wholesale Access
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section class="border-y border-border bg-secondary/30">
      <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex items-center justify-center gap-3 py-2">
            <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="lucide:shield-check" class="w-5 h-5 text-success" />
            </div>
            <div>
              <p class="font-medium text-sm">Secure Payment</p>
              <p class="text-xs text-muted-foreground">256-bit SSL encryption</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 py-2">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="lucide:truck" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="font-medium text-sm">Fast Shipping</p>
              <p class="text-xs text-muted-foreground">Free on orders over $100</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 py-2">
            <div class="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="lucide:percent" class="w-5 h-5 text-warning" />
            </div>
            <div>
              <p class="font-medium text-sm">B2B Pricing</p>
              <p class="text-xs text-muted-foreground">Up to 40% wholesale discount</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Shop by Category</h2>
          <p class="text-muted-foreground">Browse our wide selection of products across popular categories</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            :to="`/catalog?category=${category.slug}`"
            class="group flex flex-col items-center p-6 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all"
          >
            <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Icon :name="category.icon" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="font-medium text-sm text-center">{{ category.name }}</h3>
            <p class="text-xs text-muted-foreground mt-1">{{ category.productCount }} products</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16 lg:py-24 bg-secondary/30">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-3xl font-bold mb-2">Featured Products</h2>
            <p class="text-muted-foreground">Handpicked products for you</p>
          </div>
          <NuxtLink
            to="/catalog"
            class="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View All Products
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        <div class="mt-8 text-center sm:hidden">
          <NuxtLink
            to="/catalog"
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All Products
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-16 lg:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Why Choose WankaFlow?</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the best shopping experience for both retail customers and wholesale buyers.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-6 bg-card border border-border rounded-xl">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Icon name="lucide:tag" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">Competitive Pricing</h3>
            <p class="text-sm text-muted-foreground">
              Get the best prices on quality products with special discounts for wholesale buyers.
            </p>
          </div>
          <div class="p-6 bg-card border border-border rounded-xl">
            <div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <Icon name="lucide:package-check" class="w-6 h-6 text-success" />
            </div>
            <h3 class="font-semibold mb-2">Quality Guaranteed</h3>
            <p class="text-sm text-muted-foreground">
              All products are carefully vetted to ensure the highest quality standards.
            </p>
          </div>
          <div class="p-6 bg-card border border-border rounded-xl">
            <div class="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4">
              <Icon name="lucide:headphones" class="w-6 h-6 text-warning" />
            </div>
            <h3 class="font-semibold mb-2">24/7 Support</h3>
            <p class="text-sm text-muted-foreground">
              Our dedicated support team is always ready to help with any questions.
            </p>
          </div>
          <div class="p-6 bg-card border border-border rounded-xl">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Icon name="lucide:undo-2" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">Easy Returns</h3>
            <p class="text-sm text-muted-foreground">
              Hassle-free 30-day return policy on all orders for your peace of mind.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-16 lg:py-24 bg-primary">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-primary-foreground mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p class="text-primary-foreground/80 mb-8">
            Get exclusive deals, new product updates, and wholesale offers delivered to your inbox.
          </p>
          <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="flex-1 h-12 px-4 bg-white/10 border border-white/20 rounded-lg text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              :disabled="isSubscribing"
              class="h-12 px-6 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon v-if="isSubscribing" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
