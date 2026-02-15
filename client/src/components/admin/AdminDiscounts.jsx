import { useState, useEffect } from 'react';
import { Tag, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useCurrencyStore } from '../../store/currencyStore';

export default function AdminDiscounts() {
    const [targetType, setTargetType] = useState('all'); // all, category, brand, product
    const [targetId, setTargetId] = useState('');
    const [discountType, setDiscountType] = useState('percentage'); // percentage, fixed
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [daily, setDaily] = useState(false);
    const [durationHours, setDurationHours] = useState(24);

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);

    const { formatPrice } = useCurrencyStore();

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [categoriesRes, brandsRes, productsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands'),
                api.get('/products?limit=1000') // Fetch all products (or a large limit) for the dropdown
            ]);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data);
            setProducts(productsRes.data.data);
        } catch (error) {
            console.error('Error fetching options:', error);
            toast.error('Failed to load filter options');
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to apply this discount? This will update prices for all selected products.')) {
            return;
        }

        if (value <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        if (discountType === 'percentage' && value > 100) {
            toast.error('Percentage cannot be more than 100%');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/products/bulk-discount', {
                action: 'apply',
                targetType,
                targetId: targetType === 'all' ? null : targetId,
                discountType,
                discountValue: Number(value),
                daily: daily,
                durationHours: Number(durationHours || 24)
            });

            if (response.data.success) {
                toast.success(`Discount applied to ${response.data.count} products`);
                setValue('');
            }
        } catch (error) {
            console.error('Apply error:', error);
            toast.error(error.response?.data?.message || 'Failed to apply discount');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm('Are you sure you want to remove discounts? This will restore original prices for all selected products.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/products/bulk-discount', {
                action: 'remove',
                targetType,
                targetId: targetType === 'all' ? null : targetId
            });

            if (response.data.success) {
                toast.success(`Discount removed from ${response.data.count} products`);
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove discount');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Tag className="text-primary" />
                Discount Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">
                            Target Products
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="all"
                                    checked={targetType === 'all'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>All Products</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="category"
                                    checked={targetType === 'category'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>By Category</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="brand"
                                    checked={targetType === 'brand'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>By Brand</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value="product"
                                    checked={targetType === 'product'}
                                    onChange={(e) => setTargetType(e.target.value)}
                                    className="text-primary focus:ring-primary"
                                />
                                <span>Specific Product</span>
                            </label>
                        </div>
                    </div>

                    {targetType === 'category' && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Select Category
                            </label>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {targetType === 'brand' && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Select Brand
                            </label>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">Select a brand</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {targetType === 'product' && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Select Product
                            </label>
                            <select
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">Select a product</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-3">
                                Discount Type
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="discountType"
                                        value="percentage"
                                        checked={discountType === 'percentage'}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span>Percentage (%)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="discountType"
                                        value="fixed"
                                        checked={discountType === 'fixed'}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span>Fixed Amount</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Discount Value
                            </label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="input-field w-full"
                                placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50000'}
                                required
                                min="0"
                            />
                            {discountType === 'fixed' && (
                                <p className="text-xs text-text-secondary mt-1">
                                    Value should be in UZS (based on store currency rules).
                                    Note: Backend expects base currency values usually, ensure this matches logic.
                                </p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={daily}
                                        onChange={(e) => setDaily(e.target.checked)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span>Daily / temporary discount</span>
                                </label>
                                {daily && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={durationHours}
                                            onChange={(e) => setDurationHours(e.target.value)}
                                            className="input-field w-28"
                                            min="1"
                                        />
                                        <span className="text-xs text-text-secondary">hours</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 flex items-start gap-2 text-sm text-yellow-500">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <p>
                                    Applying a discount will set the current price as the "Compare Price" (Original Price) if not already set.
                                    Make sure to remove discounts before applying new ones to avoid stacking issues or incorrect base prices.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (targetType !== 'all' && !targetId)}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? <RotateCcw className="animate-spin" size={20} /> : <Save size={20} />}
                                Apply Discount
                            </button>

                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={loading}
                                className="p-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={20} />
                                Remove Discount (Restore Prices)
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

