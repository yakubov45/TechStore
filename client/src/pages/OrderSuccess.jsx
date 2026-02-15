import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Download } from 'lucide-react';
import { useCurrencyStore } from '../store/currencyStore';
import { useTranslation } from 'react-i18next';

export default function OrderSuccess() {
    const location = useLocation();
    const { formatPrice } = useCurrencyStore();
    const { t } = useTranslation();
    const { order } = location.state || {}; // Expect order details passed via state

    if (!order) {
        return <Navigate to="/" replace />;
    }

    // Generate QR Code URL (pointing to a hypothetical verify endpoint)
    const qrData = `${window.location.origin}/verify-order/${order._id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto card p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">{t('order.successTitle')}</h1>
                <p className="text-text-secondary mb-8">
                    {t('order.id')}: <span className="font-mono font-bold text-primary">{order._id}</span>
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-8 text-left">
                    <div>
                        <h3 className="font-bold mb-4">{t('order.details')}</h3>
                        <div className="space-y-2 text-sm">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span className="text-text-secondary">
                                        {item.product?.name || 'Product'} (x{item.quantity})
                                    </span>
                                    <span className="font-semibold">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>{t('order.total')}</span>
                                <span className="text-primary">{formatPrice(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <img
                            src={qrCodeUrl}
                            alt="Order QR Code"
                            className="w-32 h-32 mb-2 border-4 border-white rounded-lg"
                        />
                        <p className="text-xs text-text-secondary">{t('order.scanQr')}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
                        <Home size={20} />
                        {t('order.returnHome')}
                    </Link>
                    <Link to="/products" className="btn-primary flex items-center justify-center gap-2">
                        <ShoppingBag size={20} />
                        {t('order.continueShopping')}
                    </Link>
                    <button onClick={handlePrint} className="btn-secondary flex items-center justify-center gap-2">
                        <Download size={20} />
                        {t('order.print')}
                    </button>
                </div>
            </div>
        </div>
    );
}
