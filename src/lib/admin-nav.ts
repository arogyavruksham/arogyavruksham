export type AdminNavGroup = 'Overview' | 'Commerce' | 'Marketing' | 'People' | 'System'

export type AdminNavItem = {
  name: string
  path: string
  icon: string
  group: AdminNavGroup
  description: string
  exact?: boolean
  roles?: Array<'admin' | 'manager' | 'editor'>
}

export const ADMIN_NAV: AdminNavItem[] = [
  {
    name: 'Overview',
    path: '/admin',
    icon: 'Sparkles',
    group: 'Overview',
    description: 'Live store snapshot, shortcuts, and recent activity',
    exact: true,
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: 'BarChart2',
    group: 'Overview',
    description: 'Revenue, profit, order times, and daily performance',
    roles: ['admin'],
  },
  {
    name: 'Command Center',
    path: '/admin/ai-summary',
    icon: 'Bot',
    group: 'Overview',
    description: 'AI-powered business intelligence, alerts, and improvement suggestions',
  },
  {
    name: 'Products',
    path: '/admin/products',
    icon: 'Package',
    group: 'Commerce',
    description: 'Add, edit, price, and publish catalog items',
  },
  {
    name: 'Inventory',
    path: '/admin/inventory',
    icon: 'Archive',
    group: 'Commerce',
    description: 'Stock levels, restock alerts, and quantity updates',
  },
  {
    name: 'Orders & Sales',
    path: '/admin/orders',
    icon: 'ShoppingCart',
    group: 'Commerce',
    description: 'Fulfillment, status updates, payments, and exports',
  },
  {
    name: 'Categories',
    path: '/admin/categories',
    icon: 'LayoutGrid',
    group: 'Commerce',
    description: 'Shop filters, category images, and store navigation',
  },
  {
    name: 'Offers & Coupons',
    path: '/admin/offers',
    icon: 'Tag',
    group: 'Marketing',
    description: 'Promo codes, discount windows, and usage limits',
  },
  {
    name: 'Announcement',
    path: '/admin/announcement',
    icon: 'Megaphone',
    group: 'Marketing',
    description: 'Site-wide banner copy, colors, and call-to-action',
  },
  {
    name: 'Newsletter',
    path: '/admin/newsletter',
    icon: 'Mail',
    group: 'Marketing',
    description: 'Subscriber list, exports, and signup capture',
  },
  {
    name: 'Customers',
    path: '/admin/customers',
    icon: 'Users',
    group: 'People',
    description: 'Accounts, contact details, and staff role access',
    roles: ['admin', 'manager'],
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: 'Settings',
    group: 'System',
    description: 'Store contact, stock alerts, and panel preferences',
    roles: ['admin', 'manager'],
  },
]

export function isNavActive(pathname: string | null, item: AdminNavItem) {
  if (!pathname) return false
  if (item.exact) return pathname === item.path
  return pathname === item.path || pathname.startsWith(`${item.path}/`)
}

export function filterNavForRole(role?: string) {
  return ADMIN_NAV.filter((item) => {
    if (role === 'editor') return ['Products', 'Inventory'].includes(item.name)
    if (role === 'manager') return item.name !== 'Analytics'
    if (item.roles && role && !item.roles.includes(role as 'admin')) return false
    return true
  })
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = ['Overview', 'Commerce', 'Marketing', 'People', 'System']
