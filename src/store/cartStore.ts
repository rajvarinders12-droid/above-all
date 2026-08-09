import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    cartItemId: string; // unique string identifier
    productId: string;
    name: string;
    price: number;
    imageUrl: string;
    colorName?: string;
    size?: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => set((state) => {
                const existingItem = state.items.find(i => i.cartItemId === item.cartItemId);
                if (existingItem) {
                    return {
                        items: state.items.map(i =>
                            i.cartItemId === item.cartItemId
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        )
                    };
                }
                return { items: [...state.items, item] };
            }),
            removeItem: (cartItemId) => set((state) => ({
                items: state.items.filter(i => i.cartItemId !== cartItemId)
            })),
            updateQuantity: (cartItemId, quantity) => set((state) => ({
                items: state.items.map(i =>
                    i.cartItemId === cartItemId
                        ? { ...i, quantity: Math.max(1, quantity) }
                        : i
                )
            })),
            clearCart: () => set({ items: [] }),
            getCartTotal: () => {
                const rawTotal = get().items.reduce((total, item) => total + ((Number(item.price) || 0) * item.quantity), 0);
                return Number.isNaN(rawTotal) ? 0 : rawTotal;
            },
            getCartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'above-all-cart', // local storage key
        }
    )
);
