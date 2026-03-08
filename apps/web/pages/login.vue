<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Login failed'
  }

  isLoading.value = false
}

const loginAsDemo = (role: 'RETAIL' | 'WHOLESALE' | 'ADMIN') => {
  authStore.loginAsDemo(role)
  router.push(role === 'ADMIN' ? '/admin' : '/')
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

      <!-- Login Card -->
      <div class="bg-card border border-border rounded-2xl p-8">
        <h1 class="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p class="text-muted-foreground text-center mb-8">Sign in to your account to continue</p>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p class="text-sm text-destructive">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-2 block">Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="text-sm font-medium mb-2 block">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-border accent-primary"
              />
              <span class="text-sm">Remember me</span>
            </label>
            <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
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
          Sign in with Google
        </button>

        <!-- Demo Accounts -->
        <div class="mt-8 pt-6 border-t border-border">
          <p class="text-sm text-muted-foreground text-center mb-4">Try demo accounts:</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              class="py-2 px-3 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              @click="loginAsDemo('RETAIL')"
            >
              Retail
            </button>
            <button
              type="button"
              class="py-2 px-3 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
              @click="loginAsDemo('WHOLESALE')"
            >
              Wholesale
            </button>
            <button
              type="button"
              class="py-2 px-3 text-xs font-medium bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors"
              @click="loginAsDemo('ADMIN')"
            >
              Admin
            </button>
          </div>
        </div>

        <!-- Register Link -->
        <p class="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary hover:underline font-medium">Sign up</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
