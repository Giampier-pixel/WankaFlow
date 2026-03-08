<script setup lang="ts">
import { products, categories } from '~/data/mock'
import { formatCurrency } from '~/lib/utils'
import type { Product } from '~/types'

definePageMeta({
  layout: 'admin'
})

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const isSlideOverOpen = ref(false)
const editingProduct = ref<Product | null>(null)

// Filter products
const filteredProducts = computed(() => {
  let result = [...products]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    result = result.filter(p => p.status === selectedStatus.value)
  }

  return result
})

const columns = [
  { key: 'image', label: 'Product', width: '300px' },
  { key: 'sku', label: 'SKU', width: '120px' },
  { key: 'category', label: 'Category' },
  { key: 'retailPrice', label: 'Retail', align: 'right' as const },
  { key: 'wholesalePrice', label: 'Wholesale', align: 'right' as const },
  { key: 'stock', label: 'Stock', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'actions', label: '', width: '80px', align: 'right' as const }
]

const openAddProduct = () => {
  editingProduct.value = null
  isSlideOverOpen.value = true
}

const openEditProduct = (product: Product) => {
  editingProduct.value = { ...product }
  isSlideOverOpen.value = true
}

const closeSlideOver = () => {
  isSlideOverOpen.value = false
  editingProduct.value = null
}

// Form data for new/edit product
const formData = ref({
  name: '',
  slug: '',
  description: '',
  sku: '',
  category: '',
  brand: '',
  retailPrice: 0,
  wholesalePrice: 0,
  stock: 0,
  minStock: 10,
  status: 'active' as 'active' | 'draft' | 'archived'
})

watch(editingProduct, (product) => {
  if (product) {
    formData.value = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      stock: product.stock,
      minStock: product.minStock,
      status: product.status
    }
  } else {
    formData.value = {
      name: '',
      slug: '',
      description: '',
      sku: '',
      category: '',
      brand: '',
      retailPrice: 0,
      wholesalePrice: 0,
      stock: 0,
      minStock: 10,
      status: 'active'
    }
  }
})

const handleSave = () => {
  // In a real app, this would save to the database
  closeSlideOver()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Products</h1>
        <p class="text-muted-foreground">Manage your product catalog</p>
      </div>
      <button
        class="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        @click="openAddProduct"
      >
        <Icon name="lucide:plus" class="w-5 h-5" />
        Add Product
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex-1 min-w-[200px] max-w-md">
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
      <select
        v-model="selectedCategory"
        class="h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
      <select
        v-model="selectedStatus"
        class="h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- Products Table -->
    <DataTable
      :columns="columns"
      :data="filteredProducts"
      selectable
      empty-message="No products found"
      @row-click="openEditProduct"
    >
      <template #cell-image="{ item }">
        <div class="flex items-center gap-3">
          <img
            :src="item.images[0]"
            :alt="item.name"
            class="w-12 h-12 rounded-lg object-cover"
          />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ item.name }}</p>
            <p class="text-xs text-muted-foreground">{{ item.brand }}</p>
          </div>
        </div>
      </template>

      <template #cell-retailPrice="{ value }">
        <span class="font-medium">{{ formatCurrency(value) }}</span>
      </template>

      <template #cell-wholesalePrice="{ value }">
        <span class="text-primary">{{ formatCurrency(value) }}</span>
      </template>

      <template #cell-stock="{ item }">
        <div class="flex items-center justify-center">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              item.stock === 0 ? 'bg-destructive/10 text-destructive' :
              item.stock <= item.minStock ? 'bg-warning/10 text-warning' :
              'bg-success/10 text-success'
            ]"
          >
            {{ item.stock }}
          </span>
        </div>
      </template>

      <template #cell-status="{ value }">
        <span
          :class="[
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            value === 'active' ? 'bg-success/10 text-success' :
            value === 'draft' ? 'bg-warning/10 text-warning' :
            'bg-muted text-muted-foreground'
          ]"
        >
          {{ value }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center justify-end gap-1" @click.stop>
          <button
            class="p-2 hover:bg-secondary rounded-lg transition-colors"
            @click="openEditProduct(item)"
          >
            <Icon name="lucide:pencil" class="w-4 h-4" />
          </button>
          <button class="p-2 hover:bg-secondary rounded-lg transition-colors text-destructive">
            <Icon name="lucide:trash-2" class="w-4 h-4" />
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Slide-Over Panel -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isSlideOverOpen"
          class="fixed inset-0 bg-black/50 z-50"
          @click="closeSlideOver"
        />
      </Transition>
      <Transition name="slide">
        <div
          v-if="isSlideOverOpen"
          class="fixed top-0 right-0 h-full w-full max-w-xl bg-background border-l border-border z-50 flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h2 class="text-lg font-semibold">
              {{ editingProduct ? 'Edit Product' : 'Add Product' }}
            </h2>
            <button
              class="p-2 hover:bg-secondary rounded-lg transition-colors"
              @click="closeSlideOver"
            >
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Form -->
          <div class="flex-1 overflow-y-auto p-6">
            <form class="space-y-6">
              <!-- Basic Info -->
              <div class="space-y-4">
                <h3 class="font-medium">Basic Information</h3>
                <div>
                  <label class="text-sm font-medium mb-2 block">Product Name</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product name"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium mb-2 block">SKU</label>
                    <input
                      v-model="formData.sku"
                      type="text"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">Slug</label>
                    <input
                      v-model="formData.slug"
                      type="text"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="product-slug"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium mb-2 block">Description</label>
                  <textarea
                    v-model="formData.description"
                    rows="4"
                    class="w-full px-3 py-2 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter product description"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium mb-2 block">Category</label>
                    <select
                      v-model="formData.category"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select category</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                        {{ cat.name }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">Brand</label>
                    <input
                      v-model="formData.brand"
                      type="text"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Brand name"
                    />
                  </div>
                </div>
              </div>

              <!-- Pricing -->
              <div class="space-y-4">
                <h3 class="font-medium">Pricing</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium mb-2 block">Retail Price</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        v-model.number="formData.retailPrice"
                        type="number"
                        step="0.01"
                        class="w-full h-10 pl-7 pr-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">Wholesale Price</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        v-model.number="formData.wholesalePrice"
                        type="number"
                        step="0.01"
                        class="w-full h-10 pl-7 pr-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inventory -->
              <div class="space-y-4">
                <h3 class="font-medium">Inventory</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium mb-2 block">Stock Quantity</label>
                    <input
                      v-model.number="formData.stock"
                      type="number"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium mb-2 block">Min Stock Alert</label>
                    <input
                      v-model.number="formData.minStock"
                      type="number"
                      class="w-full h-10 px-3 bg-secondary border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="space-y-4">
                <h3 class="font-medium">Status</h3>
                <div class="flex gap-4">
                  <label
                    v-for="status in ['active', 'draft', 'archived']"
                    :key="status"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      :value="status"
                      v-model="formData.status"
                      class="w-4 h-4 accent-primary"
                    />
                    <span class="text-sm capitalize">{{ status }}</span>
                  </label>
                </div>
              </div>

              <!-- Images Placeholder -->
              <div class="space-y-4">
                <h3 class="font-medium">Images</h3>
                <div class="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Icon name="lucide:image-plus" class="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p class="text-sm text-muted-foreground">
                    Drag and drop images here, or click to browse
                  </p>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-4 border-t border-border">
            <button
              class="px-4 py-2 bg-secondary hover:bg-secondary/80 font-medium rounded-lg transition-colors"
              @click="closeSlideOver"
            >
              Cancel
            </button>
            <button
              class="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              @click="handleSave"
            >
              {{ editingProduct ? 'Save Changes' : 'Add Product' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
