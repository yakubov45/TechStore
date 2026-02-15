import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCategories = await Category.countDocuments();

    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    // Get recent orders
    const recentOrders = await Order.find()
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5);

    // Get sales by status
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    res.json({
        success: true,
        data: {
            stats: {
                totalOrders,
                totalProducts,
                totalUsers,
                totalCategories,
                totalRevenue
            },
            orderStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            },
            recentOrders
        }
    });
});

// @desc    Get sales data for charts
// @route   GET /api/analytics/sales
// @access  Private/Admin
export const getSalesData = asyncHandler(async (req, res) => {
    // Get last 7 days sales data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sales = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo },
                paymentStatus: 'paid'
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: "$total" },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        success: true,
        data: sales
    });
});
