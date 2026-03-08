<script setup lang="ts">
import { products, categories } from '~/data/mock'
import { formatCurrency } from '~/lib/utils'

const route = useRoute()

// Filters
const selectedCategory = ref<string | null>(route.query.category as string || null)
const priceRange = ref([0, 500])
const selectedBrands = ref<string[]>([])
const inStockOnly = ref(false)
const searchQuery = ref('')
const sortBy = ref('featured')
const viewMode = ref<'grid' | 'list'>('grid')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12

// Get unique brands
const brands = computed(() => {
  const brandSet = new Set(products.map(p => p.brand))
  return Array.from(brandSet)
})

// Filter products
const filteredProducts = computed(() => {
  let result = [...products]

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    )
  }

  // Category
  if (selectedCategory.value) {
    result = result.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.value)
  }

  // Price range
  result = result.filter(p => p.retailPrice >= priceRange.value[0] && p.retailPrice <= priceRange.value[1])

  // Brands
  if (selectedBrands.value.length > 0) {
    result = result.filter(p => selectedBrands.value.includes(p.brand))
  }

  // In stock
  if (inStockOnly.value) {
    result = result.filter(p => p.stock > 0)
  }

  // Sort
  switch (sortBy.value) {
    case 'price-low':
      result.sort((a, b) => a.retailPrice - b.retailPrice)
      break
    case 'price-high':
      result.sort((a, b) => b.retailPrice - a.retailPrice)
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  return result
})

// Paginated products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const isMobileFiltersOpen = ref(false)

const clearFilters = () => {
  selectedCategory.value = null
  priceRange.value = [0, 500]
  selectedBrands.value = []
  inStockOnly.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Product Catalog</h1>
        <p class="text-muted-foreground">Browse our complete collection of products</p>
      </div>

      <div class="flex gap-8">
        <!-- Sidebar Filters (Desktop) -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="sticky top-24 space-y-6">
            <!-- Search -->
            <div>
              <label class="text-sm font-medium mb-2 block">Search</label>
              <div class="relative">
                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  class="w-full h-10 pl-10 pr-4 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <!-- Categories -->
            <div>
              <label class="text-sm font-medium mb-3 block">Category</label>
              <div class="space-y-2">
                <button
                  :class="[
                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                    !selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  ]"
                  @click="selectedCategory = null"
                >
                  All Categories
                </button>
                <button
                  v-for="category in categories"
                  :key="category.id"
                  :class="[
                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between',
                    selectedCategory === category.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  ]"
                  @click="selectedCategory = category.slug"
                >
                  <span>{{ category.name }}</span>
                  <span class="text-xs opacity-70">{{ category.productCount }}</span>
                </button>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <label class="text-sm font-medium mb-3 block">Price Range</label>
              <div class="px-2">
                <input
                  type="range"
                  :min="0"
                  :max="500"
                  v-model="priceRange[1]"
                  class="w-full accent-primary"
                />
                <div class="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{{ formatCurrency(priceRange[0]) }}</span>
                  <span>{{ formatCurrency(priceRange[1]) }}</span>
                </div>
              </div>
            </div>

            <!-- Brands -->
            <div>
              <label class="text-sm font-medium mb-3 block">Brand</label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <label
                  v-for="brand in brands"
                  :key="brand"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="brand"
                    v-model="selectedBrands"
                    class="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span class="text-sm">{{ brand }}</span>
                </label>
              </div>
            </div>

            <!-- In Stock Only -->
            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="inStockOnly"
                  class="w-4 h-4 rounded border-border accent-primary"
                />
                <span class="text-sm font-medium">In Stock Only</span>
              </label>
            </div>

            <!-- Clear Filters -->
            <button
              class="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              @click="clearFilters"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Top Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
            <div class="flex items-center gap-4">
              <!-- Mobile Filters Toggle -->
              <button
                class="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                @click="isMobileFiltersOpen = true"
              >
                <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
                Filters
              </button>

              <p class="text-sm text-muted-foreground">
                {{ filteredProducts.length }} products
              </p>
            </div>

            <div class="flex items-center gap-3">
              <!-- Sort -->
              <select
                v-model="sortBy"
                class="h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>

              <!-- View Toggle -->
              <div class="hidden sm:flex items-center bg-secondary rounded-lg p-1">
                <button
                  :class="[
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  ]"
                  @click="viewMode = 'grid'"
                >
                  <Icon name="lucide:grid-3x3" class="w-4 h-4" />
                </button>
                <button
                  :class="[
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  ]"
                  @click="viewMode = 'list'"
                >
                  <Icon name="lucide:list" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div
            v-if="paginatedProducts.length > 0"
            :class="[
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            ]"
          >
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              :view="viewMode"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16">
            <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="lucide:search-x" class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-medium mb-2">No products found</h3>
            <p class="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            <button
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              @click="clearFilters"
            >
              Clear Filters
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
            <button
              :disabled="currentPage === 1"
              class="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="currentPage--"
            >
              <Icon name="lucide:chevron-left" class="w-5 h-5" />
            </button>
            
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                :class="[
                  'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                ]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <span
                v-else-if="page === currentPage - 2 || page === currentPage + 2"
                class="px-1"
              >
                ...
              </span>
            </template>

            <button
              :disabled="currentPage === totalPages"
              class="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              @click="currentPage++"
            >
              <Icon name="lucide:chevron-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filters Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isMobileFiltersOpen"
          class="fixed inset-0 bg-black/50 z-50 lg:hidden"
          @click="isMobileFiltersOpen = false"
        />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="isMobileFiltersOpen"
          class="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl max-h-[80vh] overflow-y-auto lg:hidden"
        >
          <div class="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
            <h3 class="font-semibold">Filters</h3>
            <button @click="isMobileFiltersOpen = false">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
          <div class="p-4 space-y-6">
            <!-- Same filter content as sidebar -->
            <div>
              <label class="text-sm font-medium mb-2 block">Search</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full h-10 px-4 bg-secondary border-0 rounded-lg text-sm"
              />
            </div>
            
            <div>
              <label class="text-sm font-medium mb-3 block">Category</label>
              <div class="flex flex-wrap gap-2">
                <button
                  :class="[
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  ]"
                  @click="selectedCategory = null"
                >
                  All
                </button>
                <button
                  v-for="category in categories"
                  :key="category.id"
                  :class="[
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    selectedCategory === category.slug ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  ]"
                  @click="selectedCategory = category.slug"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>

            <div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="inStockOnly"
                  class="w-4 h-4 rounded border-border accent-primary"
                />
                <span class="text-sm font-medium">In Stock Only</span>
              </label>
            </div>
          </div>
          <div class="sticky bottom-0 bg-background border-t border-border p-4 flex gap-3">
            <button
              class="flex-1 py-3 bg-secondary rounded-lg text-sm font-medium"
              @click="clearFilters"
            >
              Clear All
            </button>
            <button
              class="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              @click="isMobileFiltersOpen = false"
            >
              Show Results
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
