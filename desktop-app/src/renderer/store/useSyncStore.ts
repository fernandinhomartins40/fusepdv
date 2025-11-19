import { create } from 'zustand'
import api from '../lib/api'

interface SyncState {
  isSyncing: boolean
  lastSyncAt: Date | null
  pendingProducts: number
  pendingSales: number
  isOnline: boolean
  autoSync: boolean
  syncProducts: () => Promise<void>
  syncSales: () => Promise<void>
  syncAll: () => Promise<void>
  toggleAutoSync: () => void
  checkOnlineStatus: () => void
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncAt: null,
  pendingProducts: 0,
  pendingSales: 0,
  isOnline: navigator.onLine,
  autoSync: true,

  checkOnlineStatus: () => {
    set({ isOnline: navigator.onLine })
  },

  syncProducts: async () => {
    const { isOnline, isSyncing } = get()
    if (!isOnline || isSyncing) return

    set({ isSyncing: true })

    try {
      // Get local products that need sync (via IPC)
      const localProducts = await window.electron?.invoke('get-pending-products') || []

      if (localProducts.length > 0) {
        // Push local changes to server
        await api.post('/sync/products', { products: localProducts })
      }

      // Pull remote changes
      const { data } = await api.get('/sync/products', {
        params: {
          lastSyncAt: get().lastSyncAt
        }
      })

      // Save to local DB (via IPC)
      if (data.products && data.products.length > 0) {
        await window.electron?.invoke('save-products', data.products)
      }

      set({
        lastSyncAt: new Date(),
        pendingProducts: 0
      })
    } catch (error) {
      console.error('Erro ao sincronizar produtos:', error)
    } finally {
      set({ isSyncing: false })
    }
  },

  syncSales: async () => {
    const { isOnline, isSyncing } = get()
    if (!isOnline || isSyncing) return

    set({ isSyncing: true })

    try {
      // Get local sales that need sync (via IPC)
      const localSales = await window.electron?.invoke('get-pending-sales') || []

      if (localSales.length > 0) {
        // Push local sales to server
        await api.post('/sync/sales', { sales: localSales })
      }

      // Pull remote sales
      const { data } = await api.get('/sync/sales', {
        params: {
          lastSyncAt: get().lastSyncAt
        }
      })

      // Save to local DB (via IPC)
      if (data.sales && data.sales.length > 0) {
        await window.electron?.invoke('save-sales', data.sales)
      }

      set({
        lastSyncAt: new Date(),
        pendingSales: 0
      })
    } catch (error) {
      console.error('Erro ao sincronizar vendas:', error)
    } finally {
      set({ isSyncing: false })
    }
  },

  syncAll: async () => {
    await get().syncProducts()
    await get().syncSales()
  },

  toggleAutoSync: () => {
    set(state => ({ autoSync: !state.autoSync }))
  }
}))

// Auto sync every 5 minutes if enabled
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { autoSync, isOnline } = useSyncStore.getState()
    if (autoSync && isOnline) {
      useSyncStore.getState().syncAll()
    }
  }, 5 * 60 * 1000)

  // Listen to online/offline events
  window.addEventListener('online', () => {
    useSyncStore.getState().checkOnlineStatus()
    useSyncStore.getState().syncAll()
  })

  window.addEventListener('offline', () => {
    useSyncStore.getState().checkOnlineStatus()
  })
}
