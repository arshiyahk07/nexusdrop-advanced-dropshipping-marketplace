import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CartItem, Product } from '@shared/types';
import { api } from '@/lib/api-client';
export interface CartState {
  items: Record<string, CartItem>;
  itemCount: number;
  totalPrice: number;
  isInitialized: boolean;
  actions: {
    addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
    removeItem: (variantId: string) => Promise<void>;
    updateQuantity: (variantId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    recalculateTotals: () => Promise<void>;
  };
}
const recalculateTotalsAndUpdateState = async (
  items: Record<string, CartItem>,
  set: (fn: (state: CartState) => void) => void
) => {
  let itemCount = 0;
  let totalPrice = 0;
  if (Object.keys(items).length > 0) {
    try {
      // In a real-world scenario with many products, you'd fetch only the needed ones.
      // For this project, fetching all and filtering is acceptable.
      const allProducts = await api<Product[]>('/api/products');
      const productsById = new Map(allProducts.map(p => [p.id, p]));
      for (const item of Object.values(items)) {
        itemCount += item.quantity;
        const product = productsById.get(item.productId);
        if (product) {
          const variant = product.variants.find(v => v.id === item.variantId);
          const itemPrice = product.price + (variant?.priceModifier ?? 0);
          totalPrice += itemPrice * item.quantity;
        }
      }
    } catch (error) {
      console.error("Failed to recalculate cart totals:", error);
      // Keep existing totals on error to avoid a jarring UX
    }
  }
  set((state) => {
    state.itemCount = itemCount;
    state.totalPrice = totalPrice;
    state.isInitialized = true;
  });
};
export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: {},
      itemCount: 0,
      totalPrice: 0,
      isInitialized: false,
      actions: {
        recalculateTotals: async () => {
          await recalculateTotalsAndUpdateState(get().items, set);
        },
        addItem: async (productId, variantId, quantity = 1) => {
          const currentItems = { ...get().items };
          const existingItem = currentItems[variantId];
          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            currentItems[variantId] = { productId, variantId, quantity };
          }
          set(state => { state.items = currentItems; });
          await recalculateTotalsAndUpdateState(currentItems, set);
        },
        removeItem: async (variantId) => {
          const currentItems = { ...get().items };
          delete currentItems[variantId];
          set(state => { state.items = currentItems; });
          await recalculateTotalsAndUpdateState(currentItems, set);
        },
        updateQuantity: async (variantId, quantity) => {
          const currentItems = { ...get().items };
          if (quantity > 0) {
            if (currentItems[variantId]) {
              currentItems[variantId].quantity = quantity;
            }
          } else {
            delete currentItems[variantId];
          }
          set(state => { state.items = currentItems; });
          await recalculateTotalsAndUpdateState(currentItems, set);
        },
        clearCart: () =>
          set((state) => {
            state.items = {};
            state.itemCount = 0;
            state.totalPrice = 0;
          }),
      },
    })),
    {
      name: 'nexusdrop-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Defer recalculation until after rehydration
          setTimeout(() => state.actions.recalculateTotals(), 0);
        }
      },
    }
  )
);