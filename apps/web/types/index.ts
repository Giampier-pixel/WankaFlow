export type UserRole = 'RETAIL' | 'WHOLESALE' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  businessName?: string
  creditLimit?: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount: number
}

export interface VolumePricing {
  minQty: number
  maxQty: number | null
  price: number
}

export interface ProductVariant {
  id: string
  name: string
  type: 'size' | 'color'
  options: string[]
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  images: string[]
  category: string
  brand: string
  retailPrice: number
  wholesalePrice: number
  volumePricing: VolumePricing[]
  stock: number
  minStock: number
  status: 'active' | 'draft' | 'archived'
  variants?: ProductVariant[]
  warehouseLocation?: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedVariants?: Record<string, string>
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type PaymentMethod = 'card' | 'bank_transfer'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  shippingAddress: Address
  statusHistory: StatusHistoryItem[]
  createdAt: string
  updatedAt: string
}

export interface StatusHistoryItem {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface Address {
  name: string
  street: string
  city: string
  state: string
  country: string
  zip: string
  phone?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  role: UserRole
  businessName?: string
  totalOrders: number
  totalSpent: number
  creditLimit?: number
  status: 'active' | 'pending' | 'blocked'
  createdAt: string
}

export interface StatsCard {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

export interface Notification {
  id: string
  type: 'order' | 'stock' | 'customer' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface ReportData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  date: string
}
