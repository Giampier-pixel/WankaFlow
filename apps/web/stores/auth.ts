import { defineStore } from 'pinia'
import type { User, UserRole } from '~/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isWholesale: (state): boolean => state.user?.role === 'WHOLESALE',
    isAdmin: (state): boolean => state.user?.role === 'ADMIN',
    isRetail: (state): boolean => state.user?.role === 'RETAIL',
    userRole: (state): UserRole | null => state.user?.role ?? null
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user based on email
        const role: UserRole = email.includes('admin') 
          ? 'ADMIN' 
          : email.includes('wholesale') 
            ? 'WHOLESALE' 
            : 'RETAIL'
        
        this.user = {
          id: '1',
          email,
          name: email.split('@')[0],
          role,
          businessName: role === 'WHOLESALE' ? 'Wholesale Corp' : undefined,
          creditLimit: role === 'WHOLESALE' ? 50000 : undefined,
          createdAt: new Date().toISOString()
        }
        this.isAuthenticated = true
        
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Invalid credentials' }
      } finally {
        this.isLoading = false
      }
    },

    async register(data: {
      name: string
      email: string
      password: string
      role: 'RETAIL' | 'WHOLESALE'
      businessName?: string
    }) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.user = {
          id: '1',
          email: data.email,
          name: data.name,
          role: data.role,
          businessName: data.businessName,
          creditLimit: data.role === 'WHOLESALE' ? 10000 : undefined,
          createdAt: new Date().toISOString()
        }
        this.isAuthenticated = true
        
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Registration failed' }
      } finally {
        this.isLoading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      navigateTo('/')
    },

    // For demo purposes - login as different user types
    loginAsDemo(role: UserRole) {
      this.user = {
        id: '1',
        email: `${role.toLowerCase()}@demo.com`,
        name: `Demo ${role}`,
        role,
        businessName: role === 'WHOLESALE' ? 'Demo Wholesale Inc.' : undefined,
        creditLimit: role === 'WHOLESALE' ? 25000 : undefined,
        createdAt: new Date().toISOString()
      }
      this.isAuthenticated = true
    }
  }
})
