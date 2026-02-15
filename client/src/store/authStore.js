import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            login: async (email, password) => {
                const response = await api.post('/auth/login', { email, password });
                const { user, accessToken, refreshToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                set({ user, accessToken, refreshToken, isAuthenticated: true });
                return response.data;
            },

            register: async (userData) => {
                const response = await api.post('/auth/register', userData);
                const { user, accessToken, refreshToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                set({ user, accessToken, refreshToken, isAuthenticated: true });
                return response.data;
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                }

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            addToWishlist: async (productId) => {
                try {
                    const response = await api.post(`/users/wishlist/${productId}`);
                    set((state) => ({
                        user: {
                            ...state.user,
                            wishlist: [...state.user.wishlist, productId]
                        }
                    }));
                    return response.data;
                } catch (error) {
                    console.error('Add to wishlist error:', error);
                    throw error;
                }
            },

            removeFromWishlist: async (productId) => {
                try {
                    const response = await api.delete(`/users/wishlist/${productId}`);
                    set((state) => ({
                        user: {
                            ...state.user,
                            wishlist: state.user.wishlist.filter(id => id !== productId)
                        }
                    }));
                    return response.data;
                } catch (error) {
                    console.error('Remove from wishlist error:', error);
                    throw error;
                }
            },

            updateUser: (user) => {
                set({ user });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);
