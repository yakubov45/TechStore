import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useCurrencyStore = create(
    persist(
        (set, get) => ({
            currency: 'UZS', // Default currency
            exchangeRate: 1, // Default rate (1 USD = 1 USD)
            uzsRate: 12500, // Default UZS rate, will be fetched from server
            loading: false,

            setCurrency: (currency) => set({ currency }),

            fetchExchangeRate: async () => {
                set({ loading: true });
                try {
                    const response = await api.get('/currency');
                    if (response.data.success) {
                        set({ uzsRate: response.data.data.rate, loading: false });
                    } else {
                        set({ loading: false }); // Ensure loading stops even if success is false
                    }
                } catch (error) {
                    console.error('Failed to fetch exchange rate:', error);
                    set({ loading: false });
                    // Keep existing rate on error to prevent UI breaking
                }
            },

            // Convert price based on selected currency
            formatPrice: (priceInUsd) => {
                if (priceInUsd === undefined || priceInUsd === null) return '0 UZS';
                const { currency, uzsRate } = get();

                if (currency === 'UZS') {
                    const priceInUzs = priceInUsd * uzsRate;
                    return new Intl.NumberFormat('uz-UZ', {
                        style: 'currency',
                        currency: 'UZS',
                        maximumFractionDigits: 0
                    }).format(priceInUzs);
                }

                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(priceInUsd);
            }
        }),
        {
            name: 'currency-storage',
            partialize: (state) => ({ currency: state.currency, uzsRate: state.uzsRate }),
        }
    )
);
