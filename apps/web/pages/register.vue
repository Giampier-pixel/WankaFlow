<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const formData = ref({
  name: '',
  email: '',
  password: '',
  accountType: (route.query.type as 'RETAIL' | 'WHOLESALE') || 'RETAIL',
  businessName: '',
  agreeTerms: false
})

const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!formData.value.agreeTerms) {
    error.value = 'You must agree to the terms and conditions'
    return
  }

  error.value = ''
  isLoading.value = true

  const result = await authStore.register({
    name: formData.value.name,
    email: formData.value.email,
    password: formData.value.password,
    role: formData.value.accountType,
    businessName: formData.value.accountType === 'WHOLESALE' ? formData.value.businessName : undefined
  })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Registration failed'
  }

  isLoading.value = false
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Icon name="lucide:zap" class="w-6 h-6 text-primary-foreground" />
          </div>
          <span class="text-2xl font-bold">WankaFlow</span>
        </NuxtLink>
      </div>

      <!-- Register Card -->
      <div class="bg-card border border-border rounded-2xl p-8">
        <h1 class="text-2xl font-bold text-center mb-2">Create an account</h1>
        <p class="text-muted-foreground text-center mb-8">Join WankaFlow and start shopping</p>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p class="text-sm text-destructive">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Full Name</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Password</label>
            <input
              v-model="formData.password"
              type="password"
              required
              minlength="8"
              class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Min. 8 characters"
            />
          </div>

          <!-- Account Type Toggle -->
          <div>
            <label class="text-sm font-medium mb-3 block">Account Type</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                :class="[
                  'py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                  formData.accountType === 'RETAIL'
                    ? 'bg-background shadow-sm'
                    : 'hover:bg-background/50'
                ]"
                @click="formData.accountType = 'RETAIL'"
              >
                <Icon name="lucide:user" class="w-4 h-4 inline-block mr-1" />
                Retail
              </button>
              <button
                type="button"
                :class="[
                  'py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                  formData.accountType === 'WHOLESALE'
                    ? 'bg-background shadow-sm'
                    : 'hover:bg-background/50'
                ]"
                @click="formData.accountType = 'WHOLESALE'"
              >
                <Icon name="lucide:building-2" class="w-4 h-4 inline-block mr-1" />
                Wholesale
              </button>
            </div>
          </div>

          <!-- Business Name (Wholesale Only) -->
          <Transition name="fade-slide">
            <div v-if="formData.accountType === 'WHOLESALE'">
              <label class="text-sm font-medium mb-2 block">Business Name</label>
              <input
                v-model="formData.businessName"
                type="text"
                :required="formData.accountType === 'WHOLESALE'"
                class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your Company Inc."
              />
              <p class="text-xs text-muted-foreground mt-2">
                Wholesale accounts require approval. You'll be notified once your account is verified.
              </p>
            </div>
          </Transition>

          <!-- Terms Checkbox -->
          <label class="flex items-start gap-2 cursor-pointer">
            <input
              v-model="formData.agreeTerms"
              type="checkbox"
              class="w-4 h-4 mt-0.5 rounded border-border accent-primary"
            />
            <span class="text-sm text-muted-foreground">
              I agree to the
              <a href="#" class="text-primary hover:underline">Terms of Service</a>
              and
              <a href="#" class="text-primary hover:underline">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <!-- Social Login -->
        <button
          type="button"
          class="w-full h-11 bg-secondary hover:bg-secondary/80 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="lucide:chrome" class="w-5 h-5" />
          Sign up with Google
        </button>

        <!-- Login Link -->
        <p class="text-center text-sm text-muted-foreground mt-8">
          Already have an account?
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
