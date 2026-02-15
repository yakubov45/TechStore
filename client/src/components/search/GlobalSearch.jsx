import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { createPortal } from 'react-dom';

export default function GlobalSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], categories: [], brands: [] });
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            setRecentSearches(recent.slice(0, 5));
        }
    }, [isOpen]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.length >= 2) {
                performSearch();
            } else {
                setResults({ products: [], categories: [], brands: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
            setResults(response.data.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSearch = (searchQuery) => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updated = [searchQuery, ...recent.filter(q => q !== searchQuery)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleProductClick = (product) => {
        saveSearch(product.name);
        navigate(`/product/${product.slug}`);
        onClose();
    };

    const handleCategoryClick = (category) => {
        saveSearch(category.name);
        navigate(`/category/${category.slug}`);
        onClose();
    };

    const handleRecentClick = (searchQuery) => {
        setQuery(searchQuery);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center pt-20 px-4">
            <div className="w-full max-w-3xl bg-dark-card rounded-2xl border border-primary/30 shadow-glow animate-slide-up">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-800">
                    <Search className="text-primary" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products, categories, brands..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-lg outline-none"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-dark-secondary rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Results */}
                <div className="max-h-[500px] overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-text-secondary">Searching...</p>
                        </div>
                    ) : query.length < 2 ? (
                        <div>
                            {recentSearches.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                                        <TrendingUp size={16} />
                                        Recent Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((search, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleRecentClick(search)}
                                                className="px-3 py-1 bg-dark-secondary hover:bg-primary/20 rounded-full text-sm transition"
                                            >
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="text-text-secondary text-center py-8">
                                Start typing to search...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Products */}
                            {results.products.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Products</h3>
                                    <div className="space-y-2">
                                        {results.products.map(product => (
                                            <button
                                                key={product._id}
                                                onClick={() => handleProductClick(product)}
                                                className="w-full flex items-center gap-4 p-3 hover:bg-dark-secondary rounded-lg transition text-left"
                                            >
                                                {product.images?.[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-sm text-text-secondary">{product.brand?.name}</p>
                                                </div>
                                                <p className="text-primary font-bold">{product?.price?.toLocaleString() || '0'} UZS</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {results.categories.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Categories</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {results.categories.map(category => (
                                            <button
                                                key={category._id}
                                                onClick={() => handleCategoryClick(category)}
                                                className="flex items-center gap-3 p-3 hover:bg-dark-secondary rounded-lg transition text-left"
                                            >
                                                <span className="text-2xl">{category.icon || '📦'}</span>
                                                <div>
                                                    <p className="font-semibold">{category.name}</p>
                                                    <p className="text-xs text-text-secondary">{category.productCount} products</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Brands */}
                            {results.brands.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary mb-3">Brands</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {results.brands.map(brand => (
                                            <Link
                                                key={brand._id}
                                                to={`/brand/${brand.slug}`}
                                                onClick={() => {
                                                    saveSearch(brand.name);
                                                    onClose();
                                                }}
                                                className="px-4 py-2 bg-dark-secondary hover:bg-primary/20 rounded-lg transition"
                                            >
                                                {brand.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results */}
                            {results.products.length === 0 && results.categories.length === 0 && results.brands.length === 0 && (
                                <p className="text-text-secondary text-center py-8">
                                    No results found for "{query}"
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
