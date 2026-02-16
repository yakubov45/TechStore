import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Grid, Tag, DollarSign, Users, ShoppingBag, Layers, Activity, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import CategoryModal from '../components/admin/CategoryModal';
import BrandModal from '../components/admin/BrandModal';
import AdminCurrency from '../components/admin/AdminCurrency';
import AdminDiscounts from '../components/admin/AdminDiscounts';
import { useCurrencyStore } from '../store/currencyStore';

export default function Admin() {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { formatPrice } = useCurrencyStore();

    // Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            toast.error('Admin access required');
            navigate('/');
            return;
        }

        fetchData();
    }, [isAuthenticated, user]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const params = {};
            if (paymentFilter && paymentFilter !== 'all') params.paymentMethod = paymentFilter;
            if (deliveryFilter && deliveryFilter !== 'all') params.deliveryOption = deliveryFilter;
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

            const res = await api.get('/orders/all/list', { params });
            setOrders(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, paymentFilter, deliveryFilter, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes, brandsRes, statsRes] = await Promise.all([
                api.get('/products?limit=100'),
                api.get('/categories'),
                api.get('/brands'),
                api.get('/analytics/dashboard')
            ]);

            setProducts(productsRes.data.data);
            setCategories(categoriesRes.data.data);
            setBrands(brandsRes.data.data);
            setStats(statsRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return;

        try {
            await api.delete(`/categories/${id}`);
            toast.success('Category deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!confirm('Delete this brand?')) return;

        try {
            await api.delete(`/brands/${id}`);
            toast.success('Brand deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete brand');
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'orders', label: 'Orders', icon: ShoppingBag, count: stats ? stats.stats.totalOrders : 0 },
        { id: 'products', label: 'Products', icon: Package, count: products.length },
        { id: 'categories', label: 'Categories', icon: Grid, count: categories.length },
        { id: 'brands', label: 'Brands', icon: Tag, count: brands.length },
        { id: 'discounts', label: 'Discounts', icon: Tag, count: null },
        { id: 'currency', label: 'Currency', icon: DollarSign, count: null }
    ];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-96"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'bg-dark-secondary text-text-secondary hover:bg-dark-card hover:text-text-primary'
                            }`}
                    >
                        <tab.icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                        {tab.count !== null && (
                            <span className="ml-2 px-2 py-0.5 bg-black/30 rounded-full text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
                <div className="space-y-8 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card p-6 border-l-4 border-primary hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <DollarSign size={24} />
                                </div>
                                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded">+12%</span>
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Total Revenue</h3>
                            <p className="text-2xl font-bold">{formatPrice(stats.stats.totalRevenue)}</p>
                        </div>

                        <div className="card p-6 border-l-4 border-blue-500 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                    <ShoppingBag size={24} />
                                </div>
                                <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">{stats.stats.totalOrders} total</span>
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Total Orders</h3>
                            <p className="text-2xl font-bold">{stats.orderStatus.delivered + stats.orderStatus.processing}</p>
                        </div>

                        <div className="card p-6 border-l-4 border-purple-500 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                    <Package size={24} />
                                </div>
                                <span className="text-xs font-semibold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">{stats.stats.totalCategories} cats</span>
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Total Products</h3>
                            <p className="text-2xl font-bold">{stats.stats.totalProducts}</p>
                        </div>

                        <div className="card p-6 border-l-4 border-orange-500 hover:translate-y-[-4px] transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">New this week</span>
                            </div>
                            <h3 className="text-text-secondary text-sm font-medium mb-1">Total Customers</h3>
                            <p className="text-2xl font-bold">{stats.stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Status Breakdown */}
                        <div className="card p-6 lg:col-span-1">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-primary" />
                                Order Status
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Pending', count: stats.orderStatus.pending, color: 'bg-yellow-500' },
                                    { label: 'Processing', count: stats.orderStatus.processing, color: 'bg-blue-500' },
                                    { label: 'Delivered', count: stats.orderStatus.delivered, color: 'bg-green-500' },
                                    { label: 'Cancelled', count: stats.orderStatus.cancelled, color: 'bg-red-500' }
                                ].map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{item.label}</span>
                                            <span>{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-dark-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color}`}
                                                style={{ width: `${(item.count / stats.stats.totalOrders) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="card p-6 lg:col-span-2">
                            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Clock size={20} className="text-primary" />
                                    Recent Orders
                                </span>
                                <button className="text-sm text-primary hover:underline">View All</button>
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-text-secondary border-b border-gray-800">
                                            <th className="pb-4 font-medium">Customer</th>
                                            <th className="pb-4 font-medium">Date</th>
                                            <th className="pb-4 font-medium">Status</th>
                                            <th className="pb-4 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {stats.recentOrders.map((order) => (
                                            <tr key={order._id} className="group">
                                                <td className="py-4">
                                                    <div>
                                                        <p className="font-semibold group-hover:text-primary transition-colors">{order.customerInfo.name}</p>
                                                        <p className="text-xs text-text-secondary">{order.customerInfo.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-text-secondary">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                            order.orderStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                                                    'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right font-bold text-primary">
                                                    {formatPrice(order.total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Products</h2>
                        <button
                            onClick={() => navigate('/admin/products/new')}
                            className="btn-primary px-4 py-2 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Product
                        </button>
                    </div>

                    <div className="card overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-800">
                                <tr className="text-left">
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Brand</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id} className="border-b border-gray-800 hover:bg-dark-secondary">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.images?.[0] && (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-xs text-text-secondary">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">{product.category?.name}</td>
                                        <td className="p-4 text-sm">{product.brand?.name}</td>
                                        <td className="p-4">
                                            <p className="text-primary font-bold">
                                                {formatPrice(product.price)}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-sm ${product.stock > 20 ? 'bg-green-500/20 text-green-500' :
                                                product.stock > 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {product.featured && (
                                                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                                    Featured
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    className="p-2 hover:bg-primary/20 rounded transition"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="p-2 hover:bg-red-500/20 text-red-500 rounded transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Orders</h2>
                        <div className="flex items-center gap-2">
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="bg-dark-card text-sm px-3 py-2 rounded"
                            >
                                <option value="all">All Payments</option>
                                <option value="online">Online</option>
                                <option value="cash">Cash</option>
                            </select>

                            <select
                                value={deliveryFilter}
                                onChange={(e) => setDeliveryFilter(e.target.value)}
                                className="bg-dark-card text-sm px-3 py-2 rounded"
                            >
                                <option value="all">All Delivery</option>
                                <option value="pickup">Pickup</option>
                                <option value="standard">Delivery</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-dark-card text-sm px-3 py-2 rounded"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                                onClick={async () => {
                                    // refetch orders with filters
                                    await fetchOrders();
                                }}
                                className="btn-primary px-4 py-2"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-text-secondary border-b border-gray-800">
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Payment</th>
                                    <th className="p-4">Delivery</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.map(order => (
                                    <React.Fragment key={order._id}>
                                        <tr key={order._id} className="group">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold">{order.customerInfo?.name || order.user?.name}</p>
                                                    <p className="text-xs text-text-secondary">{order.customerInfo?.email || order.user?.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-text-secondary">{new Date(order.createdAt).toLocaleString()}</td>
                                            <td className="p-4">{order.paymentMethod}</td>
                                            <td className="p-4">{order.deliveryOption}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.orderStatus === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                    order.orderStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-primary">{formatPrice(order.total)}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                                        className="p-2 hover:bg-primary/20 rounded"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                        className="p-2 hover:bg-dark-card rounded"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedOrderId === order._id && (
                                            <tr key={`${order._id}-items`} className="bg-dark-secondary">
                                                <td colSpan={7} className="p-4">
                                                    <div className="space-y-3">
                                                        {order.items.map((it) => (
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
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Categories</h2>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setIsCategoryModalOpen(true);
                            }}
                            className="btn-primary px-4 py-2 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(category => (
                            <div key={category._id} className="card p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{category.icon || '📦'}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{category.name}</h3>
                                            <p className="text-sm text-text-secondary">{category.description}</p>
                                            <p className="text-xs text-primary mt-1">
                                                {category.productCount} products
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setIsCategoryModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-primary/20 rounded transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category._id)}
                                            className="p-2 hover:bg-red-500/20 text-red-500 rounded transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Brands Tab */}
            {activeTab === 'brands' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Brands</h2>
                        <button
                            onClick={() => {
                                setEditingBrand(null);
                                setIsBrandModalOpen(true);
                            }}
                            className="btn-primary px-4 py-2 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Brand
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {brands.map(brand => (
                            <div key={brand._id} className="card p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-lg">{brand.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingBrand(brand);
                                                setIsBrandModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-primary/20 rounded transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBrand(brand._id)}
                                            className="p-2 hover:bg-red-500/20 text-red-500 rounded transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary mb-2">{brand.description}</p>
                                <p className="text-xs text-primary">
                                    {brand.productCount} products
                                </p>
                                {brand.featured && (
                                    <span className="mt-2 inline-block px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                        Featured
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Discounts Tab */}
            {activeTab === 'discounts' && <AdminDiscounts />}

            {/* Currency Tab */}
            {activeTab === 'currency' && <AdminCurrency />}

            {/* Modals */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={fetchData}
                initialData={editingCategory}
            />

            <BrandModal
                isOpen={isBrandModalOpen}
                onClose={() => setIsBrandModalOpen(false)}
                onSuccess={fetchData}
                initialData={editingBrand}
            />
        </div>
    );
}
