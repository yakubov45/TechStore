import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CartDrawer({ isOpen, onClose }) {
    const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-dark-card shadow-2xl animate-slide-left">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-primary" />
                                <h2 className="text-xl font-bold">Shopping Cart</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-dark-secondary rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-dark-secondary rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag size={40} className="text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
                                    <p className="text-text-secondary mb-8">Start adding some items to your cart!</p>
                                    <button
                                        onClick={() => { onClose(); navigate('/products'); }}
                                        className="btn-primary px-8"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item._id} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.images?.[0] || 'https://via.placeholder.com/100'}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                                                <p className="text-primary font-bold text-sm mt-1">
                                                    {item?.price?.toLocaleString() || '0'} UZS
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border border-gray-700 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                        className="px-3 py-1 hover:bg-dark-secondary transition"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 py-1 border-x border-gray-700 text-sm">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                        className="px-3 py-1 hover:bg-dark-secondary transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item._id)}
                                                    className="text-xs text-red-500 hover:text-red-400 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="px-6 py-8 bg-dark-secondary border-t border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-text-secondary">Subtotal</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {getTotalPrice()?.toLocaleString() || '0'} UZS
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        to="/checkout"
                                        onClick={onClose}
                                        className="w-full btn-primary py-4 flex items-center justify-center gap-2 group"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-2 text-sm text-text-secondary hover:text-white transition"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
