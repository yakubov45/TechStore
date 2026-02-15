import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Payment() {
    const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
    const { isAuthenticated, user } = useAuthStore();
    const { formatPrice, currency, uzsRate } = useCurrencyStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        street: '',
        city: 'Tashkent',
        country: 'Uzbekistan',
        deliveryOption: 'standard',
        paymentMethod: 'cash',
        notes: ''
    });

    const deliveryFees = {
        'standard': 20000 / uzsRate, // Convert approximate cost back to USD for calculation
        'express': 50000 / uzsRate,
        'pickup': 0
    };

    // Calculate totals in USD first
    const subtotal = getTotal();
    const deliveryFee = deliveryFees[formData.deliveryOption];
    const total = subtotal + deliveryFee;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please sign in to place an order');
            navigate('/signin');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                items: items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    country: formData.country
                },
                deliveryOption: formData.deliveryOption,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes
            };

            const response = await api.post('/orders', orderData);
            toast.success('Order placed successfully!');
            clearCart();
            navigate('/order-success', { state: { order: response.data.data } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="md:col-span-2 space-y-4">
                    <div className="card p-6">
                        <h2 className="text-2xl font-bold mb-4">Cart Items</h2>

                        {items.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.product._id} className="flex gap-4 border-b border-gray-800 pb-4 last:border-0">
                                        <img
                                            src={item.product.images?.[0]}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-primary">{formatPrice(item.product.price)}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    className="p-1 hover:bg-dark-secondary rounded"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    className="p-1 hover:bg-dark-secondary rounded"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                className="mt-2 text-red-500 hover:text-red400"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shipping Form */}
                    <form onSubmit={handleSubmit} className="card p-6">
                        <h2 className="text-2xl font-bold mb-4">Shipping Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        className="input-field"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2">Delivery Option</label>
                                <select
                                    value={formData.deliveryOption}
                                    onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="standard">Standard (~{formatPrice(20000 / uzsRate)})</option>
                                    <option value="express">Express (~{formatPrice(50000 / uzsRate)})</option>
                                    <option value="pickup">Pickup (Free)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2">Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="cash">Cash on Delivery</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="online">Online Payment</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2">Order Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="card p-6 sticky top-20">
                        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{formatPrice(deliveryFee)}</span>
                            </div>
                            <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(total)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading || items.length === 0}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
