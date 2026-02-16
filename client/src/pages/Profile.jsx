import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCurrencyStore } from '../store/currencyStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const updateUser = useAuthStore(state => state.updateUser);
    const { formatPrice } = useCurrencyStore();
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');
    const navigate = useNavigate();
    const [editingPhone, setEditingPhone] = useState(false);
    const [phoneValue, setPhoneValue] = useState(user?.phone || '');
    const [otpCode, setOtpCode] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        if (activeTab === 'orders') fetchOrders();
        if (activeTab === 'wishlist') fetchWishlist();
    }, [isAuthenticated, activeTab]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/users/orders');
            setOrders(res.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const res = await api.get('/users/wishlist');
            setWishlist(res.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">My Account</h1>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg text-left transition ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'bg-dark-secondary hover:bg-dark-card'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 bg-dark-secondary hover:bg-red-600/20 rounded-lg text-left transition"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </aside>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="card p-6">
                            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-text-secondary text-sm">Name</label>
                                    <p className="text-lg">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-text-secondary text-sm">Email</label>
                                    <p className="text-lg">{user?.email}</p>
                                    {!user?.isEmailVerified && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-yellow-500 text-xs">Not verified</span>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await api.post('/auth/send-otp');
                                                        toast.success('Verification code sent to your email/phone');
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error('Failed to send verification code');
                                                    }
                                                }}
                                                className="text-sm px-3 py-1 bg-primary/10 rounded text-primary"
                                            >
                                                Resend Code
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-text-secondary text-sm">Phone</label>
                                    {!editingPhone ? (
                                        <div className="flex items-center gap-4">
                                            <p className="text-lg">{user?.phone || 'Not provided'}</p>
                                            <button onClick={() => { setEditingPhone(true); setPhoneValue(user?.phone || '') }} className="text-sm px-3 py-1 bg-primary/10 rounded text-primary">Edit</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <input value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} className="input-field w-48" />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.put('/users/profile', { phone: phoneValue });
                                                        updateUser(res.data.data);
                                                        toast.success('Phone updated');
                                                        setEditingPhone(false);
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error('Failed to update phone');
                                                    }
                                                }}
                                                className="text-sm px-3 py-1 bg-primary rounded text-white"
                                            >
                                                Save
                                            </button>
                                            <button onClick={() => setEditingPhone(false)} className="text-sm px-3 py-1 bg-dark-secondary rounded">Cancel</button>
                                        </div>
                                    )}

                                    {user?.phone && (
                                        <div className="mt-2 flex items-center gap-2">
                                            {!user?.isPhoneVerified ? (
                                                <>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await api.post('/auth/send-otp');
                                                                toast.success('Verification code sent to your phone');
                                                            } catch (err) {
                                                                console.error(err);
                                                                toast.error('Failed to send code');
                                                            }
                                                        }}
                                                        className="text-sm px-3 py-1 bg-primary/10 rounded text-primary"
                                                    >
                                                        Send SMS Code
                                                    </button>
                                                    <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Enter code" className="input-field w-36" />
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await api.post('/auth/verify-otp', { code: otpCode });
                                                                updateUser(res.data.data);
                                                                toast.success('Phone verified');
                                                                setOtpCode('');
                                                            } catch (err) {
                                                                console.error(err);
                                                                toast.error(err.response?.data?.message || 'Verification failed');
                                                            }
                                                        }}
                                                        className="text-sm px-3 py-1 bg-primary rounded text-white"
                                                    >
                                                        Verify
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-green-500 text-sm">Phone verified</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-text-secondary text-sm">Member Since</label>
                                    <p className="text-lg">
                                        {new Date(user?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Order History</h2>
                            {orders.length === 0 ? (
                                <div className="card p-12 text-center text-text-secondary">
                                    No orders yet
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order._id} className="card p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-bold">Order #{order.orderNumber}</p>
                                                <p className="text-sm text-text-secondary">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm ${order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                                order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-primary/20 text-primary'
                                                }`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            {formatPrice(order.total)}
                                        </p>
                                        <p className="text-sm text-text-secondary mt-2">
                                            {order.items.length} item(s)
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">My Wishlist</h2>
                            {wishlist.length === 0 ? (
                                <div className="card p-12 text-center text-text-secondary">
                                    No items in wishlist
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {wishlist.map(product => (
                                        <div key={product._id} className="card p-4 flex gap-4">
                                            <img
                                                src={product.images?.[0]}
                                                alt={product.name}
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{product.name}</h3>
                                                <p className="text-primary">{formatPrice(product.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
