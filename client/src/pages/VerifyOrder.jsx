import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Home, Printer, Copy, AlertCircle } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyOrder() {
    const { id } = useParams();
    const { formatPrice } = useCurrencyStore();
    const { t } = useTranslation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/verify/${id}`);
                setOrder(res.data.data);
            } catch (err) {
                console.error(err);
                setError(t('order.notFound') || 'Order not found or verification failed.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, t]);

    const handlePrint = () => {
        window.print();
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(order?._id || '');
        toast.success(t('common.copiedToClipboard') || 'Copied!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center mb-6">
                    <AlertCircle size={64} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">{t('order.verificationFailed') || 'Verification Failed'}</h1>
                <p className="text-text-secondary mb-8">{error}</p>
                <Link to="/" className="btn-primary inline-flex flex-center gap-2">
                    <Home size={20} />
                    {t('order.returnHome')}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden print-area shadow-2xl">
                {/* Receipt Header */}
                <div className="bg-primary/10 p-6 flex flex-col items-center border-b border-gray-800">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle size={36} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">{t('order.verifiedReceipt') || 'Verified e-Receipt'}</h1>
                    <p className="text-sm text-text-secondary">
                        TechStore &bull; {new Date(order.createdAt).toLocaleString()}
                    </p>
                </div>

                <div className="p-8">
                    {/* Order Meta Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-gray-800 pb-8">
                        <div>
                            <p className="text-sm text-text-secondary mb-1">{t('order.id') || 'Order ID'}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-bold">{order._id}</span>
                                <button onClick={handleCopyId} className="text-gray-400 hover:text-white transition-colors">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="md:text-right flex flex-col items-start md:items-end">
                            <p className="text-sm text-text-secondary mb-1">{t('order.status') || 'Status'}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                    order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                        'bg-primary/20 text-primary'
                                }`}>
                                {(order.orderStatus || 'pending').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="mb-8 border-b border-gray-800 pb-8">
                        <h3 className="text-lg font-bold mb-4">{t('order.customerInfo') || 'Customer Information'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-secondary">{t('checkout.fullName') || 'Name'}</p>
                                <p className="font-medium">{order.customerInfo?.name || order.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">{t('checkout.email') || 'Email'}</p>
                                <p className="font-medium">{order.customerInfo?.email || order.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">{t('checkout.phone') || 'Phone'}</p>
                                <p className="font-medium">{order.customerInfo?.phone || order.user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">{t('checkout.paymentMethod') || 'Payment Method'}</p>
                                <p className="font-medium capitalize">{order.paymentMethod || 'cash'}</p>
                            </div>
                        </div>
                        {order.shippingAddress && (
                            <div className="mt-4">
                                <p className="text-sm text-text-secondary">{t('checkout.shippingAddress') || 'Delivery Address'}</p>
                                <p className="font-medium">
                                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.region}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4">{t('order.items') || 'Order Items'}</h3>
                        <div className="space-y-4">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-dark-secondary p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-dark-card rounded flex items-center justify-center shrink-0">
                                            {item.productSnapshot?.image ? (
                                                <img
                                                    src={
                                                        item.productSnapshot.image.startsWith('http')
                                                            ? item.productSnapshot.image
                                                            : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${item.productSnapshot.image}`
                                                    }
                                                    alt={item.productSnapshot?.name}
                                                    className="w-full h-full object-cover rounded"
                                                    onError={(e) => { e.target.src = '/placeholder.png'; e.target.onerror = null; }}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500">Img</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm line-clamp-1">{item.productSnapshot?.name || item.product?.name || 'Product'}</p>
                                            <p className="text-xs text-text-secondary">x{item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-sm ml-4">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-dark-secondary rounded-lg p-5">
                        <div className="space-y-3 text-sm border-b border-gray-700 pb-3 mb-3">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">{t('order.subtotal') || 'Subtotal'}</span>
                                <span>{formatPrice(order.subtotal || order.items?.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0))}</span>
                            </div>
                            {(order.deliveryFee > 0) && (
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">{t('order.deliveryFee') || 'Delivery Fee'}</span>
                                    <span>{formatPrice(order.deliveryFee)}</span>
                                </div>
                            )}
                            {(order.discount > 0) && (
                                <div className="flex justify-between text-green-500">
                                    <span>{t('order.discount') || 'Discount'}</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                            <span>{t('order.total') || 'Total'}</span>
                            <span className="text-primary">{formatPrice(order.total || order.totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8 print-hide">
                <Link to="/" className="btn-secondary flex items-center gap-2">
                    <Home size={20} />
                    <span className="hidden sm:inline">{t('order.returnHome') || 'Home'}</span>
                </Link>
                <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                    <Printer size={20} />
                    <span>{t('order.printReceipt') || 'Print Receipt'}</span>
                </button>
            </div>

            <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-area { box-shadow: none !important; border: none !important; color: black !important; }
                    .print-area * { color: black !important; }
                    .bg-dark-card, .bg-dark-secondary { background: #f8f9fa !important; }
                    .bg-primary\\/10 { background: #e9ecef !important; }
                    .text-white { color: black !important; }
                    .text-text-secondary { color: #495057 !important; }
                    .border-gray-800, .border-gray-700 { border-color: #dee2e6 !important; }
                }
            `}</style>
        </div>
    );
}
