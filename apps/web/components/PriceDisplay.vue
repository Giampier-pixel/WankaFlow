<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/lib/utils'

const props = defineProps<{
  retailPrice: number
  wholesalePrice: number
  size?: 'sm' | 'md' | 'lg'
}>()

const authStore = useAuthStore()
const showWholesale = ref(false)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return { retail: 'text-lg', wholesale: 'text-base' }
    case 'lg':
      return { retail: 'text-4xl', wholesale: 'text-2xl' }
    default:
      return { retail: 'text-2xl', wholesale: 'text-lg' }
  }
})

onMounted(() => {
  if (authStore.isWholesale) {
    setTimeout(() => {
      showWholesale.value = true
    }, 300)
  }
})
</script>

<template>
  <div class="space-y-2">
    <!-- Retail Price -->
    <div class="flex items-baseline gap-2">
      <span :class="[sizeClasses.retail, 'font-bold']">
        {{ formatCurrency(retailPrice) }}
      </span>
      <span class="text-sm text-muted-foreground">Retail</span>
    </div>

    <!-- Wholesale Price -->
    <div v-if="authStore.isWholesale" class="overflow-hidden">
      <Transition name="slide-reveal">
        <div v-if="showWholesale" class="flex items-baseline gap-2">
          <span :class="[sizeClasses.wholesale, 'font-semibold text-primary']">
            {{ formatCurrency(wholesalePrice) }}
          </span>
          <span class="text-sm text-primary/70">Wholesale</span>
          <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Save {{ Math.round((1 - wholesalePrice / retailPrice) * 100) }}%
          </span>
        </div>
      </Transition>
    </div>

    <!-- Login prompt for wholesale -->
    <div v-else class="flex items-center gap-2 mt-2">
      <div class="px-3 py-1.5 bg-secondary rounded-lg">
        <span class="text-sm text-muted-foreground blur-sm select-none">$XX.XX Wholesale</span>
      </div>
      <NuxtLink 
        to="/login" 
        class="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <Icon name="lucide:lock" class="w-3 h-3" />
        Login for wholesale price
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.slide-reveal-enter-active {
  transition: all 0.5s ease-out;
}

.slide-reveal-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
