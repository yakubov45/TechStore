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
                    const rawPriceInUzs = priceInUsd * uzsRate;
                    let priceInUzs = Math.round(rawPriceInUzs / 100000) * 100000;
                    
                    // Prevent rounding down to 0 for items originally priced > 0
                    if (priceInUzs === 0 && rawPriceInUzs > 0) {
                        priceInUzs = Math.round(rawPriceInUzs / 10000) * 10000;
                        if (priceInUzs === 0) priceInUzs = Math.ceil(rawPriceInUzs);
                    }
                    
                    return new Intl.NumberFormat('uz-UZ', {
                        style: 'currency',
                        currency: 'UZS',
                        maximumFractionDigits: 0
                    }).format(priceInUzs);
                }

                // Round USD for cleaner display (avoids very long fractional numbers)
                let roundedUsd = Math.round(priceInUsd);
                if (roundedUsd === 0 && priceInUsd > 0) roundedUsd = Number(priceInUsd.toFixed(2));

                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: roundedUsd === 0 && priceInUsd > 0 ? 2 : 0
                }).format(roundedUsd);
            }
        }),
        {
            name: 'currency-storage',
            partialize: (state) => ({ currency: state.currency, uzsRate: state.uzsRate }),
        }
    )
);
