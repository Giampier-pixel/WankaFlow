<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/lib/utils'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

// Redirect if cart is empty
if (cartStore.isEmpty) {
  router.push('/cart')
}

const currentStep = ref(1)
const paymentMethod = ref<'card' | 'bank_transfer'>('card')
const isProcessing = ref(false)

// Form data
const address = ref({
  name: authStore.user?.name || '',
  street: '',
  city: '',
  state: '',
  country: 'United States',
  zip: '',
  phone: ''
})

const cardDetails = ref({
  number: '',
  expiry: '',
  cvc: ''
})

const bankProof = ref<File | null>(null)

const steps = [
  { number: 1, title: 'Address', icon: 'lucide:map-pin' },
  { number: 2, title: 'Payment', icon: 'lucide:credit-card' },
  { number: 3, title: 'Confirm', icon: 'lucide:check-circle' }
]

const isAddressValid = computed(() => {
  return address.value.name &&
    address.value.street &&
    address.value.city &&
    address.value.state &&
    address.value.country &&
    address.value.zip
})

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    bankProof.value = input.files[0]
  }
}

const placeOrder = async () => {
  isProcessing.value = true
  // Simulate order processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  cartStore.clearCart()
  router.push('/order-success')
}

const getPrice = (product: any) => {
  return authStore.isWholesale ? product.wholesalePrice : product.retailPrice
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Checkout</h1>

      <!-- Step Indicator -->
      <div class="flex items-center justify-center mb-12">
        <div class="flex items-center">
          <template v-for="(step, index) in steps" :key="step.number">
            <div class="flex items-center">
              <div
                :class="[
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  currentStep >= step.number
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                ]"
              >
                <Icon v-if="currentStep > step.number" name="lucide:check" class="w-5 h-5" />
                <Icon v-else :name="step.icon" class="w-5 h-5" />
              </div>
              <span
                :class="[
                  'ml-2 text-sm font-medium hidden sm:block',
                  currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                ]"
              >
                {{ step.title }}
              </span>
            </div>
            <div
              v-if="index < steps.length - 1"
              :class="[
                'w-12 sm:w-24 h-0.5 mx-2 sm:mx-4',
                currentStep > step.number ? 'bg-primary' : 'bg-border'
              ]"
            />
          </template>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Form Content -->
        <div class="lg:col-span-2">
          <!-- Step 1: Address -->
          <div v-if="currentStep === 1" class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-6">Shipping Address</h2>
            <div class="grid gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Full Name</label>
                <input
                  v-model="address.name"
                  type="text"
                  class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Street Address</label>
                <input
                  v-model="address.street"
                  type="text"
                  class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123 Main Street"
                />
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium mb-2 block">City</label>
                  <input
                    v-model="address.city"
                    type="text"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium mb-2 block">State</label>
                  <input
                    v-model="address.state"
                    type="text"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="NY"
                  />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium mb-2 block">Country</label>
                  <select
                    v-model="address.country"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label class="text-sm font-medium mb-2 block">ZIP Code</label>
                  <input
                    v-model="address.zip"
                    type="text"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10001"
                  />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">Phone (Optional)</label>
                <input
                  v-model="address.phone"
                  type="tel"
                  class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button
                :disabled="!isAddressValid"
                class="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="nextStep"
              >
                Continue to Payment
              </button>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div v-if="currentStep === 2" class="bg-card border border-border rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-6">Payment Method</h2>

            <!-- Payment Tabs -->
            <div class="flex gap-2 mb-6">
              <button
                :class="[
                  'flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                  paymentMethod === 'card'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                ]"
                @click="paymentMethod = 'card'"
              >
                <Icon name="lucide:credit-card" class="w-5 h-5" />
                Credit/Debit Card
              </button>
              <button
                :class="[
                  'flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
                  paymentMethod === 'bank_transfer'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                ]"
                @click="paymentMethod = 'bank_transfer'"
              >
                <Icon name="lucide:landmark" class="w-5 h-5" />
                Bank Transfer
              </button>
            </div>

            <!-- Card Payment -->
            <div v-if="paymentMethod === 'card'" class="space-y-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Card Number</label>
                <input
                  v-model="cardDetails.number"
                  type="text"
                  class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium mb-2 block">Expiry Date</label>
                  <input
                    v-model="cardDetails.expiry"
                    type="text"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label class="text-sm font-medium mb-2 block">CVC</label>
                  <input
                    v-model="cardDetails.cvc"
                    type="text"
                    class="w-full h-11 px-4 bg-secondary border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123"
                  />
                </div>
              </div>
              <p class="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="lucide:lock" class="w-3 h-3" />
                Your payment information is secure and encrypted
              </p>
            </div>

            <!-- Bank Transfer -->
            <div v-else class="space-y-4">
              <div class="bg-secondary/50 rounded-xl p-4">
                <h3 class="font-medium mb-3">Bank Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Bank Name:</span>
                    <span class="font-medium">WankaFlow Bank</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Account Name:</span>
                    <span class="font-medium">WankaFlow Inc.</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Account Number:</span>
                    <span class="font-medium">1234567890</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Routing Number:</span>
                    <span class="font-medium">021000021</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">Upload Payment Proof</label>
                <div class="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    class="hidden"
                    id="proof-upload"
                    @change="handleFileUpload"
                  />
                  <label for="proof-upload" class="cursor-pointer">
                    <Icon name="lucide:upload" class="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p class="text-sm text-muted-foreground">
                      {{ bankProof ? bankProof.name : 'Click to upload payment proof' }}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button
                class="px-6 py-3 bg-secondary hover:bg-secondary/80 font-medium rounded-lg transition-colors"
                @click="prevStep"
              >
                Back
              </button>
              <button
                class="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                @click="nextStep"
              >
                Review Order
              </button>
            </div>
          </div>

          <!-- Step 3: Confirm -->
          <div v-if="currentStep === 3" class="space-y-6">
            <!-- Shipping Address Review -->
            <div class="bg-card border border-border rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2">
                  <Icon name="lucide:map-pin" class="w-5 h-5 text-primary" />
                  Shipping Address
                </h3>
                <button class="text-sm text-primary hover:underline" @click="currentStep = 1">Edit</button>
              </div>
              <div class="text-sm space-y-1">
                <p class="font-medium">{{ address.name }}</p>
                <p class="text-muted-foreground">{{ address.street }}</p>
                <p class="text-muted-foreground">{{ address.city }}, {{ address.state }} {{ address.zip }}</p>
                <p class="text-muted-foreground">{{ address.country }}</p>
              </div>
            </div>

            <!-- Payment Method Review -->
            <div class="bg-card border border-border rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold flex items-center gap-2">
                  <Icon name="lucide:credit-card" class="w-5 h-5 text-primary" />
                  Payment Method
                </h3>
                <button class="text-sm text-primary hover:underline" @click="currentStep = 2">Edit</button>
              </div>
              <div class="text-sm">
                <p class="font-medium">
                  {{ paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer' }}
                </p>
                <p v-if="paymentMethod === 'card'" class="text-muted-foreground">
                  **** **** **** {{ cardDetails.number.slice(-4) || '4242' }}
                </p>
                <p v-else class="text-muted-foreground">
                  {{ bankProof ? `Proof: ${bankProof.name}` : 'No proof uploaded' }}
                </p>
              </div>
            </div>

            <!-- Order Items Review -->
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="font-semibold mb-4 flex items-center gap-2">
                <Icon name="lucide:package" class="w-5 h-5 text-primary" />
                Order Items
              </h3>
              <div class="space-y-3">
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="flex items-center gap-4 py-3 border-b border-border last:border-0"
                >
                  <img
                    :src="item.product.images[0]"
                    :alt="item.product.name"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ item.product.name }}</p>
                    <p class="text-sm text-muted-foreground">Qty: {{ item.quantity }}</p>
                  </div>
                  <p class="font-medium">{{ formatCurrency(getPrice(item.product) * item.quantity) }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-between">
              <button
                class="px-6 py-3 bg-secondary hover:bg-secondary/80 font-medium rounded-lg transition-colors"
                @click="prevStep"
              >
                Back
              </button>
              <button
                :disabled="isProcessing"
                class="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                @click="placeOrder"
              >
                <Icon v-if="isProcessing" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
                {{ isProcessing ? 'Processing...' : 'Place Order' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h2 class="text-lg font-semibold mb-4">Order Summary</h2>

            <div class="space-y-3 text-sm max-h-60 overflow-y-auto mb-4">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-center gap-3"
              >
                <div class="relative">
                  <img
                    :src="item.product.images[0]"
                    :alt="item.product.name"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <span class="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {{ item.quantity }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate text-sm">{{ item.product.name }}</p>
                </div>
                <p class="font-medium">{{ formatCurrency(getPrice(item.product) * item.quantity) }}</p>
              </div>
            </div>

            <div class="border-t border-border pt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span>{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Shipping</span>
                <span>{{ cartStore.shipping === 0 ? 'Free' : formatCurrency(cartStore.shipping) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Tax</span>
                <span>{{ formatCurrency(cartStore.tax) }}</span>
              </div>
              <div v-if="cartStore.discount > 0" class="flex justify-between text-success">
                <span>Discount</span>
                <span>-{{ formatCurrency(cartStore.discount) }}</span>
              </div>
            </div>

            <div class="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-border">
              <span>Total</span>
              <span>{{ formatCurrency(cartStore.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
