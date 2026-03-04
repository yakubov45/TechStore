/**
 * Utility to format image URLs from the backend.
 * Fixes Vite proxy issues where /uploads/ fails to load by appending the full API URL.
 */

// Get base URL for backend from environment variables
const getBackendUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Remove /api if present at the end, as uploads are at the root
    if (url.endsWith('/api')) {
        url = url.slice(0, -4);
    }
    return url;
};

const BACKEND_URL = getBackendUrl();

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';

    // If it's already an absolute URL (e.g., from an external service or cloud storage)
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Ensure path starts with a slash
    const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${BACKEND_URL}${formattedPath}`;
};
