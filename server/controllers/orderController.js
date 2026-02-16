import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        // Prevent admin accounts from placing orders
        if (req.user && req.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin accounts are not allowed to place orders'
            });
        }

        const {
            items,
            shippingAddress,
            deliveryOption,
            paymentMethod,
            promoCode,
            notes,
            geoLocation
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items provided'
            });
        }

        // Calculate order totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            orderItems.push({
                product: product._id,
                productSnapshot: {
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    sku: product.sku
                },
                quantity: item.quantity,
                price: product.price
            });

            subtotal += product.price * item.quantity;

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate delivery fee
        let deliveryFee = 0;
        if (deliveryOption === 'express') {
            deliveryFee = 5; // ~65,000 UZS
        } else if (deliveryOption === 'standard') {
            deliveryFee = 2; // ~25,000 UZS
        }

        // Apply discount if promo code exists (simplified)
        const discount = 0; // Implement promo code logic here

        const total = subtotal + deliveryFee - discount;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            customerInfo: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            },
            shippingAddress,
            geoLocation,
            deliveryOption,
            deliveryFee,
            paymentMethod,
            promoCode,
            subtotal,
            discount,
            total,
            notes,
            statusHistory: [{
                status: 'pending',
                timestamp: Date.now(),
                note: 'Order created'
            }]
        });

        // Send confirmation email
        try {
            await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name images slug')
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name images slug');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Can only cancel pending or processing orders
        if (!['pending', 'processing'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order in current status'
            });
        }

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.orderStatus = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: Date.now(),
            note: 'Cancelled by customer'
        });
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const { status, paymentMethod, deliveryOption, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.orderStatus = status;
        if (paymentMethod) query.paymentMethod = paymentMethod;
        if (deliveryOption) query.deliveryOption = deliveryOption;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(limitNum)
            .skip(skip);

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            count: orders.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        order.statusHistory.push({
            status,
            timestamp: Date.now(),
            note: note || `Status updated to ${status}`
        });

        // Update payment status if delivered
        if (status === 'delivered' && order.paymentMethod === 'cash') {
            order.paymentStatus = 'paid';
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
