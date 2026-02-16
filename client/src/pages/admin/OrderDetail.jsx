import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrencyStore } from '../../store/currencyStore';

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrencyStore();

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div className="container mx-auto p-6">Loading...</div>;
    if (!order) return <div className="container mx-auto p-6">Order not found</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Order #{order._id}</h1>
                <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h3 className="font-semibold mb-2">Customer</h3>
                    <p>{order.customerInfo?.name}</p>
                    <p className="text-sm text-text-secondary">{order.customerInfo?.email}</p>
                    <p className="text-sm text-text-secondary">{order.customerInfo?.phone}</p>

                    <h3 className="font-semibold mt-4 mb-2">Shipping</h3>
                    <p>{order.shippingAddress?.addressLine || '—'}</p>
                    <p className="text-sm text-text-secondary">{order.deliveryOption} • Fee: {formatPrice(order.deliveryFee)}</p>
                </div>

                <div className="card p-4">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p>Subtotal: {formatPrice(order.subtotal)}</p>
                    <p>Discount: {formatPrice(order.discount || 0)}</p>
                    <p>Delivery: {formatPrice(order.deliveryFee)}</p>
                    <p className="font-bold mt-2">Total: {formatPrice(order.total)}</p>
                    <p className="text-sm text-text-secondary mt-2">Status: {order.orderStatus}</p>
                </div>
            </div>

            <div className="card p-4 mt-6">
                <h3 className="font-semibold mb-4">Items</h3>
                <div className="space-y-3">
                    {order.items.map(it => (
                        <div key={it._id || it.product} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {it.productSnapshot?.image && (
                                    <img src={it.productSnapshot.image} alt={it.productSnapshot.name} className="w-12 h-12 object-cover rounded" />
                                )}
                                <div>
                                    <p className="font-medium">{it.productSnapshot?.name}</p>
                                    <p className="text-xs text-text-secondary">Qty: {it.quantity} • {formatPrice(it.price)}</p>
                                </div>
                            </div>
                            <div className="text-sm font-semibold">{formatPrice(it.price * it.quantity)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
