import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import SEO from '../components/common/SEO';

export default function Products() {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000000 });

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        discountOnly: searchParams.get('discountOnly') || '',
        sort: searchParams.get('sort') || 'newest',
        page: searchParams.get('page') || 1
    });

    // Debounce state to prevent rapid API calls while sliding price
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, [i18n.language]);

    // Handle filter debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 1500); // 1.5 seconds delay

        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [debouncedFilters, i18n.language]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await api.get('/brands');
            setBrands(res.data.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(debouncedFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) params.append(key, value);
            });

            const res = await api.get(`/products?${params.toString()}`);
            setProducts(res.data.data);
            setPagination({
                total: res.data.total,
                page: res.data.page,
                pages: res.data.pages
            });
            setPriceBounds({
                min: res.data.minPriceBoundary !== undefined ? res.data.minPriceBoundary : 0,
                max: res.data.maxPriceBoundary !== undefined ? res.data.maxPriceBoundary : 1000000
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (key !== 'page') newFilters.page = 1;

        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            discountOnly: '',
            sort: 'newest',
            page: 1
        });
        setSearchParams({});
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title={t('nav.products') || 'Products'}
                description="Browse our vast collection of latest electronics and gadgets at TechStore."
            />
            <h1 className="text-4xl font-bold mb-8">{t('nav.products')}</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                    <div className="card p-6 sticky top-20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">{t('products.filter')}</h2>
                            <button onClick={clearFilters} className="text-primary text-sm hover:underline">
                                {t('products.clearAll', 'Clear All')}
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">{t('products.category', 'Category')}</h3>
                            <select
                                value={filters.category}
                                onChange={(e) => updateFilter('category', e.target.value)}
                                className="input-field text-sm"
                            >
                                <option value="">{t('products.allCategories', 'All Categories')}</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {t(`categories.names.${cat.name.toLowerCase()}`, cat.name)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Brand Filter */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">{t('products.brand', 'Brand')}</h3>
                            <select
                                value={filters.brand}
                                onChange={(e) => updateFilter('brand', e.target.value)}
                                className="input-field text-sm"
                            >
                                <option value="">{t('products.allBrands', 'All Brands')}</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Discount Toggle */}
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-semibold">{t('products.discountOnly', 'Скидка')}</h3>
                            <button
                                aria-label="Toggle discount filter"
                                onClick={() => updateFilter('discountOnly', filters.discountOnly === 'true' ? '' : 'true')}
                                className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${filters.discountOnly === 'true' ? 'bg-primary' : 'bg-gray-600'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.discountOnly === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Price Range Slider */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-6">{t('products.price', 'Цена')}</h3>

                            {/* Value Display */}
                            <div className="flex items-center justify-between mb-4 gap-4">
                                <div className="bg-primary text-white px-3 py-1.5 rounded-md font-medium text-sm w-full text-center">
                                    {Math.round(filters.minPrice || priceBounds.min)}
                                </div>
                                <div className="bg-primary text-white px-3 py-1.5 rounded-md font-medium text-sm w-full text-center">
                                    {Math.round(filters.maxPrice || priceBounds.max)}
                                </div>
                            </div>

                            {/* Dual Range Slider */}
                            <div className="relative h-2 bg-gray-700 mx-2 rounded-full mt-6">
                                {/* Active track line */}
                                <div
                                    className="absolute h-full bg-primary rounded-full"
                                    style={{
                                        left: `${priceBounds.max > priceBounds.min ? (((filters.minPrice || priceBounds.min) - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100 : 0}%`,
                                        right: `${priceBounds.max > priceBounds.min ? 100 - (((filters.maxPrice || priceBounds.max) - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100 : 0}%`
                                    }}
                                ></div>

                                <input
                                    type="range"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    value={filters.minPrice || priceBounds.min}
                                    onChange={(e) => {
                                        const value = Math.min(Number(e.target.value), (filters.maxPrice || priceBounds.max) - 10);
                                        updateFilter('minPrice', value);
                                    }}
                                    className="absolute w-full -top-2 h-0 appearance-none pointer-events-none custom-range-slider"
                                />
                                <input
                                    type="range"
                                    min={priceBounds.min}
                                    max={priceBounds.max}
                                    value={filters.maxPrice || priceBounds.max}
                                    onChange={(e) => {
                                        const value = Math.max(Number(e.target.value), (filters.minPrice || priceBounds.min) + 10);
                                        updateFilter('maxPrice', value);
                                    }}
                                    className="absolute w-full -top-2 h-0 appearance-none pointer-events-none custom-range-slider"
                                />
                            </div>

                            {/* Min/Max Labels */}
                            <div className="flex justify-between text-xs text-text-secondary mt-5 px-2">
                                <span>{Math.round(priceBounds.min)}</span>
                                <span>{Math.round(priceBounds.max)}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="flex-1 w-full">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden btn-secondary px-4 py-3 text-sm flex items-center justify-center min-w-[100px]"
                        >
                            <Filter size={20} className="inline mr-2" />
                            {t('products.filter')}
                        </button>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
                            <span className="text-sm text-text-secondary w-full sm:w-auto text-right sm:text-left mb-2 sm:mb-0">
                                {pagination.total} {t('common.items')}
                            </span>
                            <select
                                value={filters.sort}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                className="input-field text-sm w-full sm:w-auto"
                            >
                                <option value="newest">{t('products.sortOptions.newest')}</option>
                                <option value="price-asc">{t('products.sortOptions.priceAsc')}</option>
                                <option value="price-desc">{t('products.sortOptions.priceDesc')}</option>
                                <option value="rating">{t('products.sortOptions.rating')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="skeleton h-96"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-text-secondary text-lg">{t('products.notFound')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => updateFilter('page', i + 1)}
                                            className={`px-4 py-2 rounded-lg ${pagination.page === i + 1
                                                ? 'bg-primary text-white'
                                                : 'bg-dark-secondary hover:bg-primary/20'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
