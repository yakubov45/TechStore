import axios from 'axios';

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL;
    if (url) {
        // Ensure /api is appended to the full URL
        return url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach access token to each request if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Use the base instance or absolute URL for refresh to avoid relative path issues
                const response = await axios.post(`${getBaseURL()}/auth/refresh-token`, {
                    refreshToken
                });

                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Notify the SPA to handle logout client-side to avoid full-page navigation (which can cause 404 on some hosts)
                try {
                    window.dispatchEvent(new Event('techstore:logout'));
                } catch (e) {
                    // Fallback to full reload if event dispatching fails
                    window.location.href = '/signin';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
