import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import config from '../config/config.js';
import Order from '../models/Order.js';

const stripe = new Stripe(config.stripe.secretKey);

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createStripeSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Create session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.items.map(item => ({
            price_data: {
                currency: 'uzs', // Using UZS as requested for the region
                product_data: {
                    name: item.productSnapshot.name,
                    images: item.productSnapshot.image ? [item.productSnapshot.image] : [],
                },
                unit_amount: Math.round(item.price),
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${config.clientUrl}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${config.clientUrl}/payment?order_id=${orderId}`,
        metadata: {
            orderId: order._id.toString()
        }
    });

    res.json({
        success: true,
        url: session.url
    });
});

// @desc    Create Payme integration URL
// @route   POST /api/payments/payme/create
// @access  Private
export const createPaymePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Amount should be in tiyins (1 UZS = 100 tiyin)
    const amountInTiyin = Math.round(order.total * 100);
    const merchantId = config.payme?.merchantId || 'YOUR_PAYME_MERCHANT_ID';

    // Formulate string and convert to base64
    const data = `m=${merchantId};ac.order_id=${order._id};a=${amountInTiyin}`;
    const base64Data = Buffer.from(data).toString('base64');

    res.json({
        success: true,
        message: 'Payme URL generated',
        url: `https://checkout.paycom.uz/${base64Data}`
    });
});

// @desc    Create Click integration URL
// @route   POST /api/payments/click/create
// @access  Private
export const createClickPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const merchantId = config.click?.merchantId || 'YOUR_CLICK_MERCHANT_ID';
    const serviceId = config.click?.serviceId || 'YOUR_CLICK_SERVICE_ID';
    const amount = order.total;

    // Generate Click URL
    const url = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${order._id}`;

    res.json({
        success: true,
        message: 'Click URL generated',
        url: url
    });
});
