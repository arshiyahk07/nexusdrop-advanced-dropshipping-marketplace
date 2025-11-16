import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CartItem, Product, ProductVariant } from '@shared/types';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
export interface CartState {
  items: Record<string, CartItem>;
  itemCount: number;
  totalPrice: number;
  actions: {
    addItem: (productId: string, variantId: string, quantity?: number) => void;
    removeItem: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
  };
}
const calculateTotals = (items: Record<string, CartItem>) => {
  let itemCount = 0;
  let totalPrice = 0;
  const productsById = new Map(MOCK_PRODUCTS.map(p => [p.id, p]));
  for (const item of Object.values(items)) {
    itemCount += item.quantity;
    const product = productsById.get(item.productId);
    if (product) {
      const variant = product.variants.find(v => v.id === item.variantId);
      const itemPrice = product.price + (variant?.priceModifier ?? 0);
      totalPrice += itemPrice * item.quantity;
    }
  }
  return { itemCount, totalPrice };
};
export const useCartStore = create<CartState>()(
  persist(
    immer((set) => ({
      items: {},
      itemCount: 0,
      totalPrice: 0,
      actions: {
        addItem: (productId, variantId, quantity = 1) =>
          set((state) => {
            const existingItem = state.items[variantId];
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              state.items[variantId] = { productId, variantId, quantity };
            }
            const { itemCount, totalPrice } = calculateTotals(state.items);
            state.itemCount = itemCount;
            state.totalPrice = totalPrice;
          }),
        removeItem: (variantId) =>
          set((state) => {
            delete state.items[variantId];
            const { itemCount, totalPrice } = calculateTotals(state.items);
            state.itemCount = itemCount;
            state.totalPrice = totalPrice;
          }),
        updateQuantity: (variantId, quantity) =>
          set((state) => {
            if (quantity > 0) {
              if (state.items[variantId]) {
                state.items[variantId].quantity = quantity;
              }
            } else {
              delete state.items[variantId];
            }
            const { itemCount, totalPrice } = calculateTotals(state.items);
            state.itemCount = itemCount;
            state.totalPrice = totalPrice;
          }),
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
          const { itemCount, totalPrice } = calculateTotals(state.items);
          state.itemCount = itemCount;
          state.totalPrice = totalPrice;
        }
      },
    }
  )
);