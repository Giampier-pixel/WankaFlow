import type { Product, Category, Order, Customer, Notification } from '~/types'

export const categories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: 'lucide:smartphone', productCount: 156 },
  { id: '2', name: 'Clothing', slug: 'clothing', icon: 'lucide:shirt', productCount: 234 },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', icon: 'lucide:home', productCount: 189 },
  { id: '4', name: 'Sports', slug: 'sports', icon: 'lucide:dumbbell', productCount: 98 },
  { id: '5', name: 'Beauty', slug: 'beauty', icon: 'lucide:sparkles', productCount: 145 },
  { id: '6', name: 'Toys', slug: 'toys', icon: 'lucide:gamepad-2', productCount: 67 }
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    sku: 'WBH-001',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals alike.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600'
    ],
    category: 'Electronics',
    brand: 'AudioTech',
    retailPrice: 149.99,
    wholesalePrice: 89.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 89.99 },
      { minQty: 10, maxQty: 49, price: 79.99 },
      { minQty: 50, maxQty: null, price: 69.99 }
    ],
    stock: 245,
    minStock: 20,
    status: 'active',
    warehouseLocation: 'A-12-3',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-01T14:30:00Z'
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    sku: 'SFW-002',
    description: 'Track your health and fitness with this advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'
    ],
    category: 'Electronics',
    brand: 'FitPro',
    retailPrice: 299.99,
    wholesalePrice: 179.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 179.99 },
      { minQty: 10, maxQty: 49, price: 159.99 },
      { minQty: 50, maxQty: null, price: 139.99 }
    ],
    stock: 89,
    minStock: 15,
    status: 'active',
    warehouseLocation: 'A-14-2',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-28T11:15:00Z'
  },
  {
    id: '3',
    name: 'Premium Cotton T-Shirt',
    slug: 'premium-cotton-tshirt',
    sku: 'PCT-003',
    description: 'Ultra-soft 100% organic cotton t-shirt with a modern fit. Available in multiple colors and sizes.',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'
    ],
    category: 'Clothing',
    brand: 'ComfortWear',
    retailPrice: 34.99,
    wholesalePrice: 18.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 18.99 },
      { minQty: 10, maxQty: 49, price: 15.99 },
      { minQty: 50, maxQty: null, price: 12.99 }
    ],
    stock: 567,
    minStock: 50,
    status: 'active',
    variants: [
      { id: 'v1', name: 'Size', type: 'size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'v2', name: 'Color', type: 'color', options: ['White', 'Black', 'Navy', 'Gray'] }
    ],
    warehouseLocation: 'B-05-1',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-05T16:45:00Z'
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    sku: 'EOC-004',
    description: 'Professional ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back for all-day comfort.',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600',
      'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=600'
    ],
    category: 'Home & Garden',
    brand: 'ErgoMax',
    retailPrice: 449.99,
    wholesalePrice: 289.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 289.99 },
      { minQty: 10, maxQty: 49, price: 259.99 },
      { minQty: 50, maxQty: null, price: 229.99 }
    ],
    stock: 34,
    minStock: 10,
    status: 'active',
    warehouseLocation: 'C-02-4',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-02-20T09:30:00Z'
  },
  {
    id: '5',
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    sku: 'YMP-005',
    description: 'Extra thick, non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and floor exercises.',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600'
    ],
    category: 'Sports',
    brand: 'ZenFit',
    retailPrice: 59.99,
    wholesalePrice: 32.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 32.99 },
      { minQty: 10, maxQty: 49, price: 27.99 },
      { minQty: 50, maxQty: null, price: 22.99 }
    ],
    stock: 189,
    minStock: 25,
    status: 'active',
    variants: [
      { id: 'v1', name: 'Color', type: 'color', options: ['Purple', 'Blue', 'Green', 'Pink'] }
    ],
    warehouseLocation: 'D-08-2',
    createdAt: '2024-02-05T14:00:00Z',
    updatedAt: '2024-03-02T10:20:00Z'
  },
  {
    id: '6',
    name: 'Organic Face Serum',
    slug: 'organic-face-serum',
    sku: 'OFS-006',
    description: 'Revitalizing face serum with vitamin C, hyaluronic acid, and natural botanical extracts for glowing skin.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=600'
    ],
    category: 'Beauty',
    brand: 'NaturGlow',
    retailPrice: 79.99,
    wholesalePrice: 44.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 44.99 },
      { minQty: 10, maxQty: 49, price: 38.99 },
      { minQty: 50, maxQty: null, price: 32.99 }
    ],
    stock: 8,
    minStock: 20,
    status: 'active',
    warehouseLocation: 'E-03-1',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-03-04T15:10:00Z'
  },
  {
    id: '7',
    name: 'Building Blocks Set',
    slug: 'building-blocks-set',
    sku: 'BBS-007',
    description: '500-piece creative building blocks set for children ages 4+. Includes storage container and instruction booklet.',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600',
      'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600'
    ],
    category: 'Toys',
    brand: 'KidBuild',
    retailPrice: 49.99,
    wholesalePrice: 26.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 26.99 },
      { minQty: 10, maxQty: 49, price: 22.99 },
      { minQty: 50, maxQty: null, price: 18.99 }
    ],
    stock: 0,
    minStock: 30,
    status: 'active',
    warehouseLocation: 'F-01-3',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-03-06T08:45:00Z'
  },
  {
    id: '8',
    name: 'Stainless Steel Water Bottle',
    slug: 'stainless-steel-water-bottle',
    sku: 'SSW-008',
    description: 'Double-wall insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
      'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600'
    ],
    category: 'Sports',
    brand: 'HydroLife',
    retailPrice: 29.99,
    wholesalePrice: 15.99,
    volumePricing: [
      { minQty: 1, maxQty: 9, price: 15.99 },
      { minQty: 10, maxQty: 49, price: 12.99 },
      { minQty: 50, maxQty: null, price: 9.99 }
    ],
    stock: 423,
    minStock: 40,
    status: 'active',
    variants: [
      { id: 'v1', name: 'Size', type: 'size', options: ['500ml', '750ml', '1L'] },
      { id: 'v2', name: 'Color', type: 'color', options: ['Silver', 'Black', 'Blue', 'Rose Gold'] }
    ],
    warehouseLocation: 'D-10-1',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-02-25T13:30:00Z'
  }
]

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerId: '1',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    items: [
      { productId: '1', productName: 'Wireless Bluetooth Headphones', quantity: 2, unitPrice: 149.99, subtotal: 299.98 },
      { productId: '3', productName: 'Premium Cotton T-Shirt', quantity: 5, unitPrice: 34.99, subtotal: 174.95 }
    ],
    subtotal: 474.93,
    shipping: 0,
    tax: 37.99,
    total: 512.92,
    status: 'pending',
    paymentMethod: 'card',
    shippingAddress: {
      name: 'John Smith',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zip: '10001'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-03-06T10:30:00Z' }
    ],
    createdAt: '2024-03-06T10:30:00Z',
    updatedAt: '2024-03-06T10:30:00Z'
  },
  {
    id: 'ORD-002',
    customerId: '2',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    items: [
      { productId: '4', productName: 'Ergonomic Office Chair', quantity: 10, unitPrice: 289.99, subtotal: 2899.90 }
    ],
    subtotal: 2899.90,
    shipping: 0,
    tax: 231.99,
    total: 3131.89,
    status: 'paid',
    paymentMethod: 'bank_transfer',
    shippingAddress: {
      name: 'Sarah Johnson',
      street: '456 Business Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
      zip: '90001'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-03-05T14:00:00Z' },
      { status: 'paid', timestamp: '2024-03-05T16:30:00Z', note: 'Payment confirmed' }
    ],
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-05T16:30:00Z'
  },
  {
    id: 'ORD-003',
    customerId: '3',
    customerName: 'Mike Williams',
    customerEmail: 'mike.w@email.com',
    items: [
      { productId: '2', productName: 'Smart Fitness Watch', quantity: 1, unitPrice: 299.99, subtotal: 299.99 },
      { productId: '5', productName: 'Yoga Mat Premium', quantity: 1, unitPrice: 59.99, subtotal: 59.99 }
    ],
    subtotal: 359.98,
    shipping: 0,
    tax: 28.80,
    total: 388.78,
    status: 'processing',
    paymentMethod: 'card',
    shippingAddress: {
      name: 'Mike Williams',
      street: '789 Oak Lane',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      zip: '60601'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-03-04T09:00:00Z' },
      { status: 'paid', timestamp: '2024-03-04T09:05:00Z' },
      { status: 'processing', timestamp: '2024-03-04T11:00:00Z', note: 'Preparing for shipment' }
    ],
    createdAt: '2024-03-04T09:00:00Z',
    updatedAt: '2024-03-04T11:00:00Z'
  },
  {
    id: 'ORD-004',
    customerId: '4',
    customerName: 'Emma Davis',
    customerEmail: 'emma.d@email.com',
    items: [
      { productId: '6', productName: 'Organic Face Serum', quantity: 3, unitPrice: 79.99, subtotal: 239.97 }
    ],
    subtotal: 239.97,
    shipping: 9.99,
    tax: 19.20,
    total: 269.16,
    status: 'shipped',
    paymentMethod: 'card',
    shippingAddress: {
      name: 'Emma Davis',
      street: '321 Elm Street',
      city: 'Miami',
      state: 'FL',
      country: 'United States',
      zip: '33101'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-03-03T15:00:00Z' },
      { status: 'paid', timestamp: '2024-03-03T15:02:00Z' },
      { status: 'processing', timestamp: '2024-03-03T17:00:00Z' },
      { status: 'shipped', timestamp: '2024-03-04T08:00:00Z', note: 'Shipped via FedEx - Tracking: FX123456789' }
    ],
    createdAt: '2024-03-03T15:00:00Z',
    updatedAt: '2024-03-04T08:00:00Z'
  },
  {
    id: 'ORD-005',
    customerId: '5',
    customerName: 'Robert Brown',
    customerEmail: 'robert.b@email.com',
    items: [
      { productId: '8', productName: 'Stainless Steel Water Bottle', quantity: 50, unitPrice: 9.99, subtotal: 499.50 }
    ],
    subtotal: 499.50,
    shipping: 0,
    tax: 39.96,
    total: 539.46,
    status: 'delivered',
    paymentMethod: 'bank_transfer',
    shippingAddress: {
      name: 'Robert Brown',
      street: '555 Corporate Blvd',
      city: 'Houston',
      state: 'TX',
      country: 'United States',
      zip: '77001'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-02-28T10:00:00Z' },
      { status: 'paid', timestamp: '2024-02-28T14:00:00Z' },
      { status: 'processing', timestamp: '2024-02-28T16:00:00Z' },
      { status: 'shipped', timestamp: '2024-03-01T09:00:00Z' },
      { status: 'delivered', timestamp: '2024-03-03T14:30:00Z', note: 'Signed by receptionist' }
    ],
    createdAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-03-03T14:30:00Z'
  },
  {
    id: 'ORD-006',
    customerId: '6',
    customerName: 'Lisa Anderson',
    customerEmail: 'lisa.a@email.com',
    items: [
      { productId: '7', productName: 'Building Blocks Set', quantity: 2, unitPrice: 49.99, subtotal: 99.98 }
    ],
    subtotal: 99.98,
    shipping: 9.99,
    tax: 8.00,
    total: 117.97,
    status: 'cancelled',
    paymentMethod: 'card',
    shippingAddress: {
      name: 'Lisa Anderson',
      street: '888 Pine Road',
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      zip: '98101'
    },
    statusHistory: [
      { status: 'pending', timestamp: '2024-03-01T11:00:00Z' },
      { status: 'cancelled', timestamp: '2024-03-01T13:00:00Z', note: 'Cancelled by customer - changed mind' }
    ],
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-03-01T13:00:00Z'
  }
]

export const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'RETAIL',
    totalOrders: 12,
    totalSpent: 1847.50,
    status: 'active',
    createdAt: '2023-08-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'WHOLESALE',
    businessName: 'Johnson Office Supplies',
    totalOrders: 45,
    totalSpent: 28450.00,
    creditLimit: 50000,
    status: 'active',
    createdAt: '2023-06-20T14:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Williams',
    email: 'mike.w@email.com',
    role: 'RETAIL',
    totalOrders: 8,
    totalSpent: 956.80,
    status: 'active',
    createdAt: '2023-10-05T09:00:00Z'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.d@email.com',
    role: 'RETAIL',
    totalOrders: 3,
    totalSpent: 324.50,
    status: 'active',
    createdAt: '2024-01-12T16:00:00Z'
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert.b@company.com',
    role: 'WHOLESALE',
    businessName: 'Brown Distributors LLC',
    totalOrders: 67,
    totalSpent: 45670.00,
    creditLimit: 75000,
    status: 'active',
    createdAt: '2023-04-10T11:00:00Z'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    role: 'RETAIL',
    totalOrders: 1,
    totalSpent: 0,
    status: 'active',
    createdAt: '2024-02-28T13:00:00Z'
  },
  {
    id: '7',
    name: 'Tech Solutions Inc',
    email: 'orders@techsolutions.com',
    role: 'WHOLESALE',
    businessName: 'Tech Solutions Inc',
    totalOrders: 0,
    totalSpent: 0,
    creditLimit: 0,
    status: 'pending',
    createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.w@email.com',
    role: 'RETAIL',
    totalOrders: 0,
    totalSpent: 0,
    status: 'blocked',
    createdAt: '2024-01-20T15:00:00Z'
  }
]

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order',
    message: 'Order #ORD-001 received from John Smith',
    read: false,
    createdAt: '2024-03-06T10:30:00Z'
  },
  {
    id: '2',
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Organic Face Serum is running low (8 units left)',
    read: false,
    createdAt: '2024-03-06T09:00:00Z'
  },
  {
    id: '3',
    type: 'customer',
    title: 'Wholesale Request',
    message: 'Tech Solutions Inc has requested wholesale access',
    read: true,
    createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: '4',
    type: 'stock',
    title: 'Out of Stock',
    message: 'Building Blocks Set is now out of stock',
    read: true,
    createdAt: '2024-03-04T14:00:00Z'
  }
]

export const salesData = {
  labels: ['Mar 1', 'Mar 2', 'Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7'],
  datasets: [
    {
      label: 'Sales',
      data: [4200, 3800, 5100, 4600, 5800, 6200, 5400],
      color: '#4F46E5'
    }
  ]
}

export const categoryPieData = [
  { name: 'Electronics', value: 35, color: '#4F46E5' },
  { name: 'Clothing', value: 25, color: '#10B981' },
  { name: 'Home & Garden', value: 20, color: '#F59E0B' },
  { name: 'Sports', value: 12, color: '#EC4899' },
  { name: 'Other', value: 8, color: '#6B7280' }
]

// Aliased exports for components that use different naming conventions
export const mockProducts = products.map(p => ({
  ...p,
  price: p.retailPrice,
  lowStockThreshold: p.minStock
}))

export const mockOrders = orders.map(o => ({
  id: o.id,
  customer: {
    id: o.customerId,
    name: o.customerName,
    email: o.customerEmail,
    phone: ''
  },
  items: o.items.map(item => ({
    productId: item.productId,
    name: item.productName,
    quantity: item.quantity,
    price: item.unitPrice
  })),
  subtotal: o.subtotal,
  shipping: o.shipping,
  tax: o.tax,
  total: o.total,
  status: o.status,
  priority: o.total > 1000 ? 'high' : 'normal',
  paymentMethod: o.paymentMethod,
  shippingAddress: o.shippingAddress,
  createdAt: o.createdAt
}))

export const mockCustomers = customers.map(c => ({
  id: c.id,
  name: c.name,
  email: c.email,
  company: c.businessName,
  tier: c.role === 'WHOLESALE' ? 'wholesale' : c.totalSpent > 1000 ? 'vip' : 'retail',
  totalOrders: c.totalOrders,
  totalSpent: c.totalSpent,
  lastOrderDate: c.createdAt
}))

export const mockInventoryMovements = [
  { id: '1', productId: '1', productName: 'Wireless Bluetooth Headphones', type: 'in' as const, quantity: 50, reason: 'Restock from supplier', date: '2024-03-06T09:00:00Z' },
  { id: '2', productId: '6', productName: 'Organic Face Serum', type: 'out' as const, quantity: 12, reason: 'Order fulfillment', date: '2024-03-05T14:30:00Z' },
  { id: '3', productId: '3', productName: 'Premium Cotton T-Shirt', type: 'adjustment' as const, quantity: -5, reason: 'Inventory correction - damaged items', date: '2024-03-05T11:00:00Z' },
  { id: '4', productId: '8', productName: 'Stainless Steel Water Bottle', type: 'in' as const, quantity: 100, reason: 'Bulk order received', date: '2024-03-04T16:00:00Z' },
  { id: '5', productId: '7', productName: 'Building Blocks Set', type: 'out' as const, quantity: 30, reason: 'Order fulfillment - wholesale', date: '2024-03-04T10:00:00Z' },
  { id: '6', productId: '2', productName: 'Smart Fitness Watch', type: 'in' as const, quantity: 25, reason: 'Restock', date: '2024-03-03T09:00:00Z' },
  { id: '7', productId: '4', productName: 'Ergonomic Office Chair', type: 'out' as const, quantity: 10, reason: 'Corporate order shipped', date: '2024-03-02T15:00:00Z' }
]
