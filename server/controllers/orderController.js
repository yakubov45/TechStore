import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';
import ExcelJS from 'exceljs';
import { logActivity } from '../utils/logger.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Prevent admin accounts from placing orders (optional, but keeping as is)
        if (req.user && req.user.role === 'admin') {
            await session.abortTransaction();
            session.endSession();
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
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'No order items provided'
            });
        }

        // Calculate order totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
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
                price: product.price,
                _productRef: product
            });

            subtotal += product.price * item.quantity;
        }

        // Deduct stock only after ALL validations pass (avoids partial state)
        for (const orderItem of orderItems) {
            const product = orderItem._productRef;
            delete orderItem._productRef;
            product.stock -= orderItem.quantity;
            await product.save({ session });
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
        const [order] = await Order.create([{
            user: req.user._id,
            items: orderItems,
            sales_channel: 'online',
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
            paymentStatus: 'pending',
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
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Send confirmation email (outside transaction)
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
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create POS order
// @route   POST /api/orders/pos/sell
// @access  Private/Admin
export const createPosOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { qr_code_id, quantity = 1 } = req.body;

        if (!qr_code_id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'QR code ID is required'
            });
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity'
            });
        }

        // Find product by ID or SKU
        const product = await Product.findOne({
            $or: [
                { _id: qr_code_id.match(/^[0-9a-fA-F]{24}$/) ? qr_code_id : null },
                { sku: qr_code_id }
            ]
        }).session(session);

        if (!product) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Product not found from QR code'
            });
        }

        if (product.stock < qty) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
            });
        }

        // Deduct stock
        product.stock -= qty;
        await product.save({ session });

        const orderItem = {
            product: product._id,
            productSnapshot: {
                name: product.name,
                price: product.price,
                image: product.images[0],
                sku: product.sku
            },
            quantity: qty,
            price: product.price
        };

        const total = product.price * qty;

        // Create POS order
        const [order] = await Order.create([{
            user: req.user ? req.user._id : undefined, // Optional, since it's a cashier
            items: [orderItem],
            sales_channel: 'pos',
            paymentMethod: 'cash', // Defaulting POS to cash for now
            paymentStatus: 'paid',
            orderStatus: 'delivered',
            subtotal: total,
            total: total,
            statusHistory: [{
                status: 'delivered',
                timestamp: Date.now(),
                note: 'POS Sale'
            }]
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'POS Sale completed successfully',
            data: {
                order,
                updatedStock: product.stock
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
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

        // Check if order belongs to user or user is staff
        const isStaff = ['admin', 'assistant', 'delivery'].includes(req.user.role);
        if (order.user._id.toString() !== req.user._id.toString() && !isStaff) {
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

        await logActivity(req, 'UPDATE', 'Order', order._id, { status: 'cancelled', reason: 'Cancelled by customer' });

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

        await logActivity(req, 'UPDATE', 'Order', order._id, { status, note });

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

// @desc    Get order by ID for public verification
// @route   GET /api/orders/verify/:id
// @access  Public
export const getOrderForVerification = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images slug');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Invalid Order ID or ' + error.message
        });
    }
};

// @desc    Export sales to Excel
// @route   GET /api/orders/export
// @access  Private/Admin
export const exportSales = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name sku')
            .sort('-createdAt');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sotuvlar tarixi');

        // Set columns
        worksheet.columns = [
            { header: 'Order ID', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Mijoz ism', key: 'customerName', width: 25 },
            { header: 'Telefon', key: 'phone', width: 18 },
            { header: 'Mahsulotlar', key: 'products', width: 40 },
            { header: 'Turi', key: 'sales_channel', width: 15 },
            { header: 'To\'lov turi', key: 'paymentMethod', width: 15 },
            { header: 'Holat', key: 'orderStatus', width: 15 },
            { header: 'Jami Summa', key: 'total', width: 20 }
        ];

        // Add rows
        orders.forEach(order => {
            const productList = order.items.map(i => `${i.productSnapshot.name} (x${i.quantity})`).join(', ');

            worksheet.addRow({
                orderNumber: order.orderNumber,
                date: new Date(order.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
                customerName: order.customerInfo?.name || 'Kassa (POS)',
                phone: order.customerInfo?.phone || '-',
                products: productList,
                sales_channel: order.sales_channel === 'pos' ? 'Do\'kon (POS)' : 'Sayt',
                paymentMethod: order.paymentMethod,
                orderStatus: order.orderStatus,
                total: order.total
            });
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'sales_report.xlsx');

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating report: ' + error.message
        });
    }
};

