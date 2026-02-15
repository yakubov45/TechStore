import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function StickySearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ products: [], categories: [], brands: [] });
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 150);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const handleProductClick = (product) => {
        navigate(`/product/${product.slug}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div
            ref={containerRef}
            className={`transition-all duration-300 ${isScrolled
                    ? 'fixed top-2 left-1/2 -translate-x-1/2 w-full max-w-xl z-[60] px-4'
                    : 'relative w-full max-w-md hidden md:block'
                }`}
        >
            <div className={`relative flex items-center bg-dark-card border rounded-full transition-all ${isOpen ? 'border-primary ring-2 ring-primary/20 shadow-glow' : 'border-gray-800'
                }`}>
                <div className="pl-4 text-text-secondary">
                    <Search size={18} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('nav.search') + "..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-transparent py-2 px-3 outline-none text-sm"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults({ products: [], categories: [], brands: [] }); }}
                        className="pr-4 text-text-secondary hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && (query.length >= 2 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-2 text-xs text-text-secondary">Searching...</p>
                            </div>
                        ) : (
                            <>
                                {results.products.length > 0 && (
                                    <div className="p-2">
                                        <h3 className="text-[10px] uppercase tracking-wider font-bold text-text-secondary px-3 py-2">Products</h3>
                                        <div className="space-y-1">
                                            {results.products.map(product => (
                                                <button
                                                    key={product._id}
                                                    onClick={() => handleProductClick(product)}
                                                    className="w-full flex items-center gap-3 p-2 hover:bg-dark-secondary rounded-xl transition text-left group"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.images?.[0] || 'https://via.placeholder.com/100'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                                        <p className="text-xs text-primary font-bold">{product.price.toLocaleString()} UZS</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.categories.length > 0 && (
                                    <div className="p-2 border-t border-gray-800">
                                        <h3 className="text-[10px] uppercase tracking-wider font-bold text-text-secondary px-3 py-2">Categories</h3>
                                        <div className="flex flex-wrap gap-1 px-2">
                                            {results.categories.map(cat => (
                                                <Link
                                                    key={cat._id}
                                                    to={`/category/${cat.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="px-3 py-1 bg-dark-secondary hover:bg-primary/20 rounded-full text-xs transition"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.products.length === 0 && !loading && (
                                    <div className="p-8 text-center text-text-secondary text-sm">
                                        No results found for "{query}"
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
