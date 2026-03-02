import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import SEO from '../components/common/SEO';

export default function Products() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        page: searchParams.get('page') || 1
    });

    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

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
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const res = await api.get(`/products?${params.toString()}`);
            setProducts(res.data.data);
            setPagination({
                total: res.data.total,
                page: res.data.page,
                pages: res.data.pages
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
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
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

                        {/* Price Range */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">{t('products.priceRange', 'Price Range (UZS)')}</h3>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder={t('products.minPrice', 'Min')}
                                    value={filters.minPrice}
                                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                                    className="input-field text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder={t('products.maxPrice', 'Max')}
                                    value={filters.maxPrice}
                                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                    className="input-field text-sm"
                                />
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
