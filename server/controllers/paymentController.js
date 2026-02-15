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

// @desc    Mock Payme integration (Placeholder)
// @route   POST /api/payments/payme/create
// @access  Private
export const createPaymePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // In a real Payme integration, you would generate a base64 encoded URL 
    // with your merchant ID and order details.

    res.json({
        success: true,
        message: 'Payme integration placeholder',
        url: `https://checkout.paycom.uz/...`
    });
});

// @desc    Mock Click integration (Placeholder)
// @route   POST /api/payments/click/create
// @access  Private
export const createClickPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Simulating Click redirect URL generation

    res.json({
        success: true,
        message: 'Click integration placeholder',
        url: `https://my.click.uz/services/pay...`
    });
});
