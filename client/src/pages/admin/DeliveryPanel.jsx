import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle, Package, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrencyStore } from '../../store/currencyStore';
import { useTranslation } from 'react-i18next';

export default function DeliveryPanel() {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrencyStore();

    useEffect(() => {
        fetchDeliveryOrders();
    }, [i18n.language]);

    const fetchDeliveryOrders = async () => {
        setLoading(true);
        try {
            // Fetch all orders, then filter client-side for simplicity,
            // or we could pass params if the backend supports it.
            const res = await api.get('/orders/all/list');

            // Only show orders that are pending, processing, shipped, or recently delivered
            const relevantOrders = (res.data.data || []).filter(o =>
                ['pending', 'processing', 'shipped', 'delivered'].includes(o.orderStatus) && o.deliveryOption !== 'pickup'
            );

            // Sort by pending/processing first, then shipped, then delivered
            relevantOrders.sort((a, b) => {
                const statusWeight = { pending: 1, processing: 2, shipped: 3, delivered: 4 };
                return statusWeight[a.orderStatus] - statusWeight[b.orderStatus];
            });

            setOrders(relevantOrders);
        } catch (error) {
            console.error('Failed to load orders', error);
            toast.error(t('admin.fetchError', 'Failed to load delivery orders'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(t('admin.statusUpdated', 'Order status updated'));
            fetchDeliveryOrders();
        } catch (error) {
            console.error('Failed to update order', error);
            toast.error(error.response?.data?.message || t('admin.updateError', 'Failed to update order'));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="skeleton h-64 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-500/20 text-green-500 rounded-xl">
                    <Truck size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.delivery', 'Delivery Panel')}</h1>
                    <p className="text-text-secondary">{t('admin.deliveryDesc', 'Manage current deliveries')}</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="card p-8 text-center text-text-secondary">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t('admin.noDeliveries', 'No pending deliveries found.')}</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="card p-6 border-l-4 transition-all" style={{
                            borderColor: order.orderStatus === 'delivered' ? '#22c55e' :
                                order.orderStatus === 'processing' ? '#eab308' : '#3b82f6'
                        }}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold">{order.customerInfo?.name || order.user?.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                            order.orderStatus === 'processing' ? 'bg-orange-500/10 text-orange-500' :
                                                order.orderStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {t(`admin.status.${order.orderStatus}`, order.orderStatus)}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-text-secondary">
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary">{t('checkout.address', 'Address')}:</span>
                                            {order.shippingAddress?.street}, {order.shippingAddress?.city}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary">{t('checkout.phone', 'Phone')}:</span>
                                            {order.customerInfo?.phone || order.user?.phone || 'N/A'}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <div className="text-xl font-bold text-primary text-right mb-2">
                                        {formatPrice(order.total)}
                                    </div>

                                    {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                                        <button
                                            onClick={() => handleUpdateStatus(order._id, 'shipped')}
                                            className="btn-primary py-2 text-sm flex items-center justify-center gap-2"
                                        >
                                            <Truck size={16} />
                                            {t('admin.markShipped', 'Mark Shipped')}
                                        </button>
                                    )}

                                    {(order.orderStatus === 'processing' || order.orderStatus === 'shipped' || order.orderStatus === 'pending') && (
                                        <button
                                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            {t('admin.markDelivered', 'Mark Delivered')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
