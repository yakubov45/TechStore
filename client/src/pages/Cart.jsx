import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useTranslation } from 'react-i18next';

export default function Cart() {
    const { items, updateQuantity, removeItem, getTotal } = useCartStore();
    const { formatPrice } = useCurrencyStore();
    const { t } = useTranslation();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">{t('cart.empty')}</h1>
                <p className="text-text-secondary mb-8">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                    Start Shopping
                    <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2 space-y-4">
                    {items.map(item => (
                        <div key={item._id} className="card p-4 flex gap-4">
                            <Link to={`/product/${item.slug}`} className="shrink-0">
                                <img
                                    src={item.images?.[0]}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            </Link>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <Link to={`/product/${item.slug}`} className="font-bold text-lg hover:text-primary transition">
                                            {item.name}
                                        </Link>
                                        <button
                                            onClick={() => removeItem(item._id)}
                                            className="text-gray-500 hover:text-red-500 transition"
                                            title="Remove item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <p className="text-primary font-semibold">{formatPrice(item.price)}</p>
                                </div>

                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center border border-gray-700 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="p-2 hover:bg-dark-secondary rounded-l"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="px-4 font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="p-2 hover:bg-dark-secondary rounded-r"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="ml-auto font-bold text-lg">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="h-fit">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-lg">
                                <span className="text-text-secondary">{t('cart.subtotal')}</span>
                                <span className="font-bold">{formatPrice(getTotal())}</span>
                            </div>
                            <p className="text-xs text-text-secondary">
                                Shipping and taxes calculated at checkout.
                            </p>
                        </div>
                        <Link to="/payment" className="btn-primary w-full flex items-center justify-center gap-2">
                            {t('cart.checkout')}
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
