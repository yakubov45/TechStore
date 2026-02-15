import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Store flattened product objects with quantity: { ...productFields, quantity }
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find(item => item._id === product._id);

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    });
                } else {
                    set({ items: [...items, { ...product, quantity }] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter(item => item._id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                } else {
                    set({
                        items: get().items.map(item =>
                            item._id === productId
                                ? { ...item, quantity }
                                : item
                        )
                    });
                }
            },

            clearCart: () => {
                set({ items: [] });
            },

            // Keep legacy name `getTotal` and add `getTotalPrice` used by UI
            getTotal: () => {
                return get().items.reduce((total, item) => {
                    return total + (Number(item.price || 0) * item.quantity);
                }, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    return total + (Number(item.price || 0) * item.quantity);
                }, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'cart-storage'
        }
    )
);
