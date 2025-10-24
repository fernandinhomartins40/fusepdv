import { create } from 'zustand'

interface CartItem {
  productId: string
  codigo: string
  nome: string
  unidade: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  desconto: number
}

interface CartState {
  items: CartItem[]
  desconto: number
  addItem: (product: any, quantidade: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantidade: number) => void
  applyDiscount: (productId: string, desconto: number) => void
  applyCartDiscount: (desconto: number) => void
  clear: () => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  desconto: 0,

  addItem: (product, quantidade) => {
    const existing = get().items.find((item) => item.productId === product.id)

    if (existing) {
      get().updateQuantity(product.id, existing.quantidade + quantidade)
    } else {
      const subtotal = quantidade * product.precoVenda
      set((state) => ({
        items: [
          ...state.items,
          {
            productId: product.id,
            codigo: product.codigo,
            nome: product.nome,
            unidade: product.unidade,
            quantidade,
            precoUnitario: product.precoVenda,
            subtotal,
            desconto: 0,
          },
        ],
      }))
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },

  updateQuantity: (productId, quantidade) => {
    if (quantidade <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantidade,
              subtotal: quantidade * item.precoUnitario - item.desconto,
            }
          : item
      ),
    }))
  },

  applyDiscount: (productId, desconto) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              desconto,
              subtotal: item.quantidade * item.precoUnitario - desconto,
            }
          : item
      ),
    }))
  },

  applyCartDiscount: (desconto) => {
    set({ desconto })
  },

  clear: () => {
    set({ items: [], desconto: 0 })
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0)
  },

  getTotal: () => {
    return get().getSubtotal() - get().desconto
  },
}))
