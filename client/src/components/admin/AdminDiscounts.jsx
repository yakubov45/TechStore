import { useState, useEffect } from 'react';
import { Tag, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useCurrencyStore } from '../../store/currencyStore';
import { useTranslation } from 'react-i18next';

export default function AdminDiscounts() {
    const { t } = useTranslation();
    const [targetType, setTargetType] = useState('all');
    const [targetId, setTargetId] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [daily, setDaily] = useState(false);
    const [durationHours, setDurationHours] = useState(24);
    const [discountReason, setDiscountReason] = useState('');
    const [isDiscountActive, setIsDiscountActive] = useState(true);
    const [inFlashDeal, setInFlashDeal] = useState(false);

    const [flashDealsActive, setFlashDealsActive] = useState(false);
    const [flashDealsEndTime, setFlashDealsEndTime] = useState('');
    const [flashDealsSaving, setFlashDealsSaving] = useState(false);
    const [countdown, setCountdown] = useState('');

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);

    const { formatPrice } = useCurrencyStore();

    // Live countdown to flash deals end time
    useEffect(() => {
        if (!flashDealsActive || !flashDealsEndTime) { setCountdown(''); return; }
        const tick = () => {
            const diff = new Date(flashDealsEndTime) - new Date();
            if (diff <= 0) {
                setCountdown('Vaqt tugadi');
                setFlashDealsActive(false);
                try {
                    const ch = new BroadcastChannel('techstore-settings');
                    ch.postMessage({ type: 'flash-deals-toggle', value: false });
                    ch.close();
                } catch (_) { }
                return;
            }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${h}s ${m}d ${s}s qoldi`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [flashDealsActive, flashDealsEndTime]);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [categoriesRes, brandsRes, productsRes, settingsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands'),
                api.get('/products?limit=1000'),
                api.get('/settings')
            ]);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data);
            setProducts(productsRes.data.data);
            if (settingsRes.data?.data) {
                setFlashDealsActive(settingsRes.data.data.flashDealsActive);
                if (settingsRes.data.data.flashDealsEndTime) {
                    const dt = new Date(settingsRes.data.data.flashDealsEndTime);
                    // Format as datetime-local value
                    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16);
                    setFlashDealsEndTime(local);
                }
            }
        } catch (error) {
            console.error('Error fetching options:', error);
            toast.error('Failed to load filter options');
        }
    };

    const toggleFlashDeals = async () => {
        setFlashDealsSaving(true);
        try {
            // Always re-read fresh state from server first, then invert
            const freshSettings = await api.get('/settings');
            const currentVal = freshSettings.data?.data?.flashDealsActive ?? false;
            const newVal = !currentVal;

            const payload = { flashDealsActive: newVal };
            // Attach end time only when enabling and a time is set
            if (newVal && flashDealsEndTime) {
                payload.flashDealsEndTime = new Date(flashDealsEndTime).toISOString();
            }

            const res = await api.put('/settings/flash-deals', payload);
            if (res.data.success) {
                const confirmedVal = res.data.data.flashDealsActive;
                setFlashDealsActive(confirmedVal);
                toast.success(confirmedVal ? 'Flash Deals yoqildi ✅' : "Flash Deals o'chirildi ❌");
                try {
                    const ch = new BroadcastChannel('techstore-settings');
                    ch.postMessage({ type: 'flash-deals-toggle', value: confirmedVal });
                    ch.close();
                } catch (_) { }
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error("Flash Deals holatini o'zgartirish muvaffaqiyatsiz");
        } finally {
            setFlashDealsSaving(false);
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
                durationHours: Number(durationHours || 24),
                discountReason,
                isDiscountActive,
                inFlashDeal
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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Tag className="text-primary" />
                {t('admin.discountManagement', 'Discount Management')}
            </h2>

            {/* Flash Deals Global Control Card */}
            <div className="mb-8 p-4 rounded-xl border border-gray-700 bg-dark-secondary/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-sm">⚡ Homepage Flash Deals Banner</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Yoqilganda bosh sahifada Flash Deals bo'limi ko'rinadi
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${flashDealsActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {flashDealsActive ? 'YOQIQ' : 'O\'CHIQ'}
                        </span>
                        <button
                            onClick={toggleFlashDeals}
                            disabled={flashDealsSaving}
                            className={`relative inline-flex h-7 w-13 min-w-[52px] items-center rounded-full transition-colors disabled:opacity-50 ${flashDealsActive ? 'bg-primary' : 'bg-gray-600'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${flashDealsActive ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* End time picker */}
                <div className="mt-4 flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-text-secondary mb-1">
                            🕐 Avtomatik o'chirish vaqti (ixtiyoriy)
                        </label>
                        <input
                            type="datetime-local"
                            value={flashDealsEndTime}
                            onChange={(e) => setFlashDealsEndTime(e.target.value)}
                            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                            className="input-field text-sm w-full"
                        />
                        <p className="text-[10px] text-text-secondary mt-1">
                            Belgilanmasa — qo'lda o'chirilguncha ishlaydi
                        </p>
                    </div>

                    {/* Countdown */}
                    {flashDealsActive && countdown && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-center">
                            <p className="text-[10px] text-text-secondary">Tugashiga</p>
                            <p className="text-sm font-bold text-red-400 font-mono">{countdown}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">
                            {t('admin.targetProducts', 'Target Products')}
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
                                <span>{t('admin.allProducts', 'All Products')}</span>
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
                                <span>{t('admin.byCategory', 'By Category')}</span>
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
                                <span>{t('admin.byBrand', 'By Brand')}</span>
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
                                <span>{t('admin.specificProduct', 'Specific Product')}</span>
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
                                <option value="">{t('admin.form.selectCategory', 'Select a category')}</option>
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
                                <option value="">{t('admin.form.selectBrand', 'Select a brand')}</option>
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
                                <option value="">{t('admin.form.selectProduct', 'Select a product')}</option>
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
                                {t('admin.discountType', 'Discount Type')}
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
                                    <span>{t('admin.percentage', 'Percentage (%)')}</span>
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
                                    <span>{t('admin.fixedAmount', 'Fixed Amount')}</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('admin.discountReasonTitle', 'Discount Reason')}
                            </label>
                            <select
                                value={discountReason}
                                onChange={(e) => setDiscountReason(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">{t('admin.selectReason', 'Select Reason')}</option>
                                <option value="daily">{t('admin.discountReason.daily', 'Daily')}</option>
                                <option value="weekly">{t('admin.discountReason.weekly', 'Weekly')}</option>
                                <option value="monthly">{t('admin.discountReason.monthly', 'Monthly')}</option>
                                <option value="ramadan">{t('admin.discountReason.ramadan', 'Ramadan')}</option>
                                <option value="new_year">{t('admin.discountReason.newYear', 'New Year')}</option>
                                <option value="other">{t('admin.discountReason.other', 'Other')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={isDiscountActive}
                                    onChange={(e) => setIsDiscountActive(e.target.checked)}
                                    className="text-primary focus:ring-primary w-4 h-4 rounded"
                                />
                                <span className="font-medium text-sm text-text-secondary">{t('admin.enableDiscount', 'Enable this discount')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={inFlashDeal}
                                    onChange={(e) => setInFlashDeal(e.target.checked)}
                                    className="text-primary focus:ring-primary w-4 h-4 rounded"
                                />
                                <span className="font-medium text-sm text-text-secondary">{t('admin.inFlashDeal', 'Add to Homepage Flash Deals Banner')}</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                {t('admin.discountValue', 'Discount Value')}
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
                                    <span>{t('admin.dailyDiscount', 'Daily / temporary discount')}</span>
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
                                    {t('admin.discountHint', 'Applying a discount will set the current price as the "Compare Price" (Original Price) if not already set. Make sure to remove discounts before applying new ones to avoid stacking issues or incorrect base prices.')}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (targetType !== 'all' && !targetId)}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? <RotateCcw className="animate-spin" size={20} /> : <Save size={20} />}
                                {t('admin.applyDiscount', 'Apply Discount')}
                            </button>

                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={loading}
                                className="p-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={20} />
                                {t('admin.removeDiscount', 'Remove Discount (Restore Prices)')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

